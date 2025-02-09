import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json(
        { message: 'No image provided' },
        { status: 400 }
      );
    }

    const uploadRes = await cloudinary.uploader.upload(image, {
      folder: 'listings',
      resource_type: 'image',
    });

    return NextResponse.json({ url: uploadRes.secure_url }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
