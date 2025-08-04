"use server"

import connectDB from "@/db/connectDB"
import User from "@/models/Users"
import Train from "@/models/Train"
import Booking from "@/models/Booking"
import Razorpay from 'razorpay';
import crypto from 'crypto';
import shortid from 'shortid';

// Initialize Razorpay
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// A function to generate a unique PNR number
const generatePnr = () => {
    return shortid.generate().toUpperCase();
};

export const createRazorpayOrder = async ({ trainId, userId, passengers, totalFare, seatsBooked }) => {
    await connectDB();
    
    // 1. Validate if seats are available
    const train = await Train.findById(trainId);
    if (!train || train.availableSeats < seatsBooked) {
        return { error: "Not enough seats available." };
    }

    // 2. Create a new booking in 'created' status, but don't save it yet
    const pnrNumber = generatePnr();
    const newBooking = new Booking({
        userId,
        trainId,
        pnrNumber,
        passengers,
        totalFare,
        seatsBooked,
        status: 'created',
    });
    console.log(newBooking);

    // 3. Create a Razorpay order
    const options = {
        amount: totalFare * 100, // Amount in paise
        currency: "INR",
        receipt: newBooking._id.toString(), // Use the booking ID as the receipt
        payment_capture: 1, // Auto capture payment
    };

    try {
        const order = await razorpay.orders.create(options);
        // Store the Razorpay order ID in the booking record
        newBooking.razorpayOrderId = order.id;
        
        // NOW save the booking to the database with the razorpayOrderId
        await newBooking.save();
        
        return { orderId: order.id, bookingId: newBooking._id.toString(), amount: options.amount };
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return { error: "Failed to create Razorpay order." };
    }
};

export const verifyPaymentAndUpdateBooking = async ({ razorpayPaymentId, razorpayOrderId, razorpaySignature, bookingId, trainId, seatsBooked }) => {
    await connectDB();

    try {
        const hmac = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET);
        hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
        const generatedSignature = hmac.digest('hex');

        if (generatedSignature !== razorpaySignature) {
            return { error: "Payment verification failed." };
        }

        // Find the booking and update its status
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return { error: "Booking not found." };
        }
        
        if(booking.status === 'paid'){
             return { message: "Payment already processed." };
        }

        // Update the booking status and payment ID
        booking.status = 'paid';
        booking.razorpayPaymentId = razorpayPaymentId;
        await booking.save();

        // Update the train's available seats
        await Train.findByIdAndUpdate(trainId, { $inc: { availableSeats: -seatsBooked } });

        return { message: "Payment successful and booking confirmed.", bookingId: booking._id.toString() };

    } catch (error) {
        console.error("Error verifying payment:", error);
        return { error: "Failed to verify payment." };
    }
};

export const fetchUserByUsername = async (username) => {
    await connectDB();
    let user = await User.findOne({ username }).lean();
    if (!user) {
        return null;
    }
    const {_id, _v, ...rest} = user;
    return {
        ...rest, id: _id.toString(),
    };
}

// NEW: Fetch all bookings for a specific user, populating train details
export const fetchUserBookings = async (userId) => {
    await connectDB();
    const bookings = await Booking.find({ userId: userId })
        .populate({
            path: 'trainId',
            select: 'name number source destination departure arrival fare'
        })
        .sort({ createdAt: -1 })
        .lean();
    
    // Clean up Mongoose objects for Next.js serialization
    return bookings.map(booking => {
        const { _id, __v, ...rest } = booking;
        const train = booking.trainId ? {
            id: booking.trainId._id.toString(),
            name: booking.trainId.name,
            number: booking.trainId.number,
            source: booking.trainId.source,
            destination: booking.trainId.destination,
            departure: booking.trainId.departure,
            arrival: booking.trainId.arrival,
            fare: booking.trainId.fare
        } : null;

        return {
            ...rest,
            id: _id.toString(),
            trainId: train,
        };
    });
}

export const fetchAllTrains = async () => {
    await connectDB();
    const trains = await Train.find({}).lean();
    return trains.map(train => {
        const { _id, __v, ...rest } = train;
        return { ...rest, id: _id.toString() };
    });
}

// NEW: Fetch all users
export const fetchAllUsers = async () => {
    await connectDB();
    const users = await User.find({}).lean();
    return users.map(user => {
        const { _id, __v, ...rest } = user;
        return { ...rest, id: _id.toString() };
    });
}

//fetch train
export const fetchtrain = async (trainId) =>{
    await connectDB();
    let train= await Train.findOne({number: trainId}).lean();
    if(!train){
        return null;
    }
    const {_id, _v, ...rest} = train;
    return {
        ...rest, id: _id.toString(),
    };
}

//fetch user
export const fetchuser = async (email) =>{
    await connectDB();
    let user = await User.findOne({email: email}).lean();
    if(!user){
        return null;
    }
    const {_id, _v, ...rest} = user;
    return {
        ...rest, id: _id.toString(),
    };
}

// NEW: Admin function to add a new train
export const addTrain = async (newTrainData, userEmail) => {
    await connectDB();
    const adminUser = await User.findOne({ email: userEmail, is_admin: true });
    if (!adminUser) {
        return { error: "Permission denied." };
    }

    try {
        const newTrain = new Train(newTrainData);
        await newTrain.save();
        return { success: true, message: "Train added successfully." };
    } catch (error) {
        console.error("Error adding train:", error);
        return { error: "Failed to add train." };
    }
};

// NEW: Admin function to delete a train
export const deleteTrain = async (trainId, userEmail) => {
    await connectDB();
    const adminUser = await User.findOne({ email: userEmail, is_admin: true });
    if (!adminUser) {
        return { error: "Permission denied." };
    }
    try {
        const result = await Train.findByIdAndDelete(trainId);
        if (!result) {
            return { error: "Train not found." };
        }
        return { success: true, message: "Train deleted successfully." };
    } catch (error) {
        console.error("Error deleting train:", error);
        return { error: "Failed to delete train." };
    }
};

// NEW: Admin function to update a user's admin status
export const updateUserAdminStatus = async (userId, isAdmin, userEmail) => {
    await connectDB();
    const adminUser = await User.findOne({ email: userEmail, is_admin: true });
    if (!adminUser) {
        return { error: "Permission denied." };
    }
    
    // Prevent an admin from revoking their own admin status
    if (adminUser._id.toString() === userId && !isAdmin) {
        return { error: "Cannot revoke your own admin status." };
    }

    try {
        const result = await User.findByIdAndUpdate(userId, { is_admin: isAdmin });
        if (!result) {
            return { error: "User not found." };
        }
        return { success: true, message: "User admin status updated." };
    } catch (error) {
        console.error("Error updating user admin status:", error);
        return { error: "Failed to update user." };
    }
};