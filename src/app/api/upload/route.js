import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const bodyText = await req.text();
    const body = JSON.parse(bodyText);

    const { imageUrls, ...listingData } = body;

    if (!imageUrls || imageUrls.length === 0) {
      return NextResponse.json(
        { message: 'No images provided' },
        { status: 400 }
      );
    }

    // Simulate saving listing to database
    const newListing = { ...listingData, imageUrls, createdAt: new Date() };

    return NextResponse.json(
      { message: 'Listing created!', data: newListing },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: 'Server error', error },
      { status: 500 }
    );
  }
}
