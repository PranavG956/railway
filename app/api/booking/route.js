import dbConnect from '@/lib/mongodb';
import { Train } from '@/models/Booking'; // Import the updated Train model
import { createRazorpayOrder } from '@/lib/razorpay';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req) {
    await dbConnect();
    console.log("connected")
    try {
    const { trainId, passengers } = await req.json();

    if (!trainId || !passengers || passengers.length === 0) {
        return NextResponse.json({ error: 'Missing required booking information' }, { status: 400 });
    }

    // 1. Find the train and check for seat availability
    const train = await Train.findById(trainId);
    if (!train) {
        return NextResponse.json({ error: 'Train not found' }, { status: 404 });
    }

    if (train.availableSeats < passengers.length) {
        return NextResponse.json({ error: 'Not enough seats available' }, { status: 400 });
    }

    // 2. Calculate total fare
    const totalAmount = train.fare * passengers.length;
    const amountInPaisa = totalAmount * 100; // Razorpay requires amount in paisa

    // 3. Create a unique receipt ID
    const receiptId = `receipt_${uuidv4()}`;

    // 4. Create a new Razorpay order
    const order = await createRazorpayOrder(amountInPaisa, receiptId);

    return NextResponse.json({ orderId: order.id, amount: totalAmount }, { status: 200 });

    } catch (error) {
    console.error('Booking order creation error:', error);
    return NextResponse.json({ error: 'Failed to create booking order' }, { status: 500 });
    }
}
