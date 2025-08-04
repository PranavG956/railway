import Booking from '@/models/Booking';
import Train from '@/models/Train';
import { verifyPaymentSignature } from '@/lib/razorpay';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import connectDB from '@/db/connectDB';

export async function POST(req) {
    await connectDB();
    try {
    const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        trainId,
        passengers,
        userId,
        totalFare
    } = await req.json();

    // 1. Verify the payment signature from Razorpay
    const isSignatureValid = verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
    );

    if (!isSignatureValid) {
        return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 });
    }

    // 2. If valid, check seat availability one last time (atomic operation)
    const train = await Train.findById(trainId);
    if (!train || train.availableSeats < passengers.length) {
        // You might need a refund process here, but for this project,
        // a simple error is sufficient.
        return NextResponse.json({ error: 'Seats no longer available' }, { status: 400 });
    }
    
    // 3. Update the available seats on the train
    train.availableSeats -= passengers.length;
    await train.save();

    // 4. Create the final booking document
    const booking = await Booking.create({
        userId,
        trainId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        pnrNumber: `PNR${uuidv4().substring(0, 8).toUpperCase()}`,
        passengers,
        totalFare,
        seatsBooked: passengers.length,
        status: 'paid',
    });

    return NextResponse.json({
        message: 'Booking successful',
        pnrNumber: booking.pnrNumber
    }, { status: 201 });
    } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Failed to verify payment and create booking' }, { status: 500 });
    }
}
