// app/api/listing/create/route.js (for App Router)
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const body = await req.json();

    if (!body || !body.imageUrls || !body.userMongoId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Simulate saving to DB (Replace with actual DB logic)
    const newListing = {
      _id: '12345',
      ...body,
    };

    return NextResponse.json(newListing, { status: 201 });
  } catch (error) {
    console.error('Create Listing Error:', error);
    return NextResponse.json(
      { message: 'Failed to create listing', error },
      { status: 500 }
    );
  }
}
