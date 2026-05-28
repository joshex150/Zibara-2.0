import { v2 as cloudinary, type UploadApiErrorResponse, type UploadApiOptions, type UploadApiResponse } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { PassThrough } from 'stream';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
  'image/heif',
]);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.CLOUDINARY_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Upload failed', details: 'Cloudinary is not configured.' },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Upload failed', details: 'File is missing in the request.' },
        { status: 400 }
      );
    }

    if (file.size === 0) {
      return NextResponse.json(
        { error: 'Upload failed', details: 'File is empty.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { error: 'Upload failed', details: 'Image must be 10MB or smaller.' },
        { status: 400 }
      );
    }

    if (file.type && !ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: 'Upload failed', details: 'Unsupported image type.' },
        { status: 400 }
      );
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // Upload options - explicitly set resource_type to image
    // This is important for HEIC files which Cloudinary might misidentify as video
    const uploadOptions: UploadApiOptions = {
      folder: 'zibara',
      resource_type: 'image', // Explicitly set to image to prevent video detection
      use_filename: true,
      unique_filename: true,
    };

    // For HEIC files, Cloudinary will automatically convert them to a web-compatible format
    // No additional format parameter needed - Cloudinary handles HEIC natively

    // Upload to Cloudinary using upload_stream
    const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            reject(new Error('Cloudinary upload failed: ' + error.message));
          } else if (!result) {
            reject(new Error('Cloudinary upload failed: missing response'));
          } else {
            resolve(result);
          }
        }
      );

      // Write the buffer to the upload stream
      const bufferStream = new PassThrough();
      bufferStream.end(fileBuffer);
      bufferStream.pipe(uploadStream);
    });

    return NextResponse.json(
      {
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        width: uploadResult.width,
        height: uploadResult.height,
        format: uploadResult.format,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: message },
      { status: 500 }
    );
  }
}
