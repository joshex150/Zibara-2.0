import { v2 as cloudinary } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

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

    // Extract filename and file content type
    const filenameMatch = filePart.match(/filename="?([^"\r\n]+)"?/);
    const filename = filenameMatch ? filenameMatch[1] : '';
    const fileContentTypeMatch = filePart.match(/Content-Type:\s*([^\r\n]+)/);
    const fileContentType = fileContentTypeMatch ? fileContentTypeMatch[1].trim() : '';

    const fileContent = filePart.split('\r\n\r\n')[1].split('\r\n--')[0];
    const fileBuffer = Buffer.from(fileContent, 'binary');

    // Detect file extension
    const extension = filename.split('.').pop()?.toLowerCase() || '';
    const isHEIC = extension === 'heic' || extension === 'heif' || fileContentType.includes('heic') || fileContentType.includes('heif');

    // Upload options - explicitly set resource_type to image
    // This is important for HEIC files which Cloudinary might misidentify as video
    const uploadOptions: any = {
      folder: 'crochellaa',
      resource_type: 'image', // Explicitly set to image to prevent video detection
    };

    // For HEIC files, Cloudinary will automatically convert them to a web-compatible format
    // No additional format parameter needed - Cloudinary handles HEIC natively

    // Upload to Cloudinary using upload_stream
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            reject(new Error('Cloudinary upload failed: ' + error.message));
          } else {
            resolve(result);
          }
        }
      );

      // Write the buffer to the upload stream
      const stream = require('stream');
      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileBuffer);
      bufferStream.pipe(uploadStream);
    });

    return NextResponse.json(
      { url: (uploadResult as any).secure_url },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}
