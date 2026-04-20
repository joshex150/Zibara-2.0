import { v2 as cloudinary, type UploadApiErrorResponse, type UploadApiOptions, type UploadApiResponse } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';
import { PassThrough } from 'stream';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.startsWith('multipart/form-data')) {
      throw new Error('Invalid content type');
    }

    const boundary = contentType.split('boundary=')[1];
    if (!boundary) {
      throw new Error('Boundary not found in content type');
    }

    const chunks: Uint8Array[] = [];
    const reader = req.body?.getReader();
    if (!reader) {
      throw new Error('Request body is missing');
    }

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) chunks.push(value);
    }

    const buffer = Buffer.concat(chunks.map(chunk => Buffer.from(chunk)));

    const parts = buffer
      .toString('binary')
      .split(`--${boundary}`)
      .filter((part) => part.trim() && part.trim() !== '--');

    const filePart = parts.find((part) =>
      part.includes('Content-Disposition: form-data; name="file"')
    );

    if (!filePart) {
      throw new Error('File is missing in the request');
    }

    const fileContent = filePart.split('\r\n\r\n')[1].split('\r\n--')[0];
    const fileBuffer = Buffer.from(fileContent, 'binary');

    // Upload options - explicitly set resource_type to image
    // This is important for HEIC files which Cloudinary might misidentify as video
    const uploadOptions: UploadApiOptions = {
      folder: 'zibara',
      resource_type: 'image', // Explicitly set to image to prevent video detection
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
      { url: uploadResult.secure_url },
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
