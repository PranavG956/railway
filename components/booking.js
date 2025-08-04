// components/booking.js
'use client'

import React, { useEffect, useState } from 'react'
import { fetchtrain, fetchuser, createRazorpayOrder, verifyPaymentAndUpdateBooking } from '@/app/actions/useractions';
import { useSession } from 'next-auth/react';

// Make sure to add the Razorpay script to your page or a layout component
// <script src="https://checkout.razorpay.com/v1/checkout.js"></script>

const Booking = ({ trainId }) => {
    const [train, settrain] = useState({});
    const [currentuser, setcurrentuser] = useState({})
    const [passengers, setPassengers] = useState([{ name: '', age: '', gender: 'male' }]);
    const [seatsBooked, setSeatsBooked] = useState(1);
    const { data: session, status } = useSession();

    useEffect(() => {
        if (status === 'authenticated' && session?.user?.email) {
            getdata();
        }
    }, [trainId, session, status]);

    const getdata = async () => {
        let t = await fetchtrain(trainId);
        settrain(t);
        let u = await fetchuser(session.user.email);
        setcurrentuser(u);
    };

    const handlePassengerChange = (index, e) => {
        const newPassengers = [...passengers];
        newPassengers[index][e.target.name] = e.target.value;
        setPassengers(newPassengers);
    };

    const handleAddPassenger = () => {
        if (passengers.length < train.availableSeats) {
            setPassengers([...passengers, { name: '', age: '', gender: 'male' }]);
            setSeatsBooked(seatsBooked + 1);
        } else {
            alert('No more seats available on this train.');
        }
    };

    const handleRemovePassenger = (index) => {
        if (passengers.length > 1) {
            const newPassengers = [...passengers];
            newPassengers.splice(index, 1);
            setPassengers(newPassengers);
            setSeatsBooked(seatsBooked - 1);
        }
    };

    const handleBooking = async (e) => {
        e.preventDefault();

        if (seatsBooked > train.availableSeats) {
            alert('Cannot book more seats than available.');
            return;
        }

        const totalFare = train.fare * seatsBooked;

        // Call the server action to create a Razorpay order
        const { orderId, bookingId, amount, error } = await createRazorpayOrder({
            trainId: train.id,
            userId: currentuser.id,
            passengers,
            totalFare,
            seatsBooked,
        });

        if (error) {
            alert(error);
            return;
        }

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // Use NEXT_PUBLIC for client-side
            amount: amount,
            currency: "INR",
            name: "Train Booking System",
            description: "Train Ticket Booking",
            order_id: orderId,
            handler: async (response) => {
                // This function is called on successful payment
                const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = response;
                
                // Call the server action to verify payment and update the booking
                const result = await verifyPaymentAndUpdateBooking({
                    razorpayPaymentId: razorpay_payment_id,
                    razorpayOrderId: razorpay_order_id,
                    razorpaySignature: razorpay_signature,
                    bookingId,
                    trainId: train.id,
                    seatsBooked,
                });
                
                if (result.error) {
                    alert(result.error);
                } else {
                    alert(result.message);
                    // Redirect to a confirmation page or show a success message
                }
            },
            prefill: {
                name: currentuser.username,
                email: currentuser.email,
                contact: currentuser.phone || '',
            },
            notes: {
                bookingId: bookingId,
            },
            theme: {
                color: "#F37254"
            }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('razorpay_payment_failure', function (response) {
            alert("Payment failed: " + response.error.description);
            // Handle failure, e.g., show a message or redirect
        });

        rzp1.open();
    };

    if (status === 'loading') {
        return <div>Loading...</div>;
    }

    if (!train || !currentuser) {
        return <div>Loading train and user details...</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Book Tickets for {train.name}</h1>
            <p>From: {train.source} to {train.destination}</p>
            <p>Available Seats: {train.availableSeats}</p>
            <p>Fare per seat: ₹{train.fare}</p>

            <form onSubmit={handleBooking} className="mt-4">
                {passengers.map((passenger, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 mb-4 p-4 border rounded">
                        <input
                            type="text"
                            name="name"
                            placeholder="Passenger Name"
                            value={passenger.name}
                            onChange={(e) => handlePassengerChange(index, e)}
                            required
                            className="flex-1 p-2 border rounded"
                        />
                        <input
                            type="number"
                            name="age"
                            placeholder="Age"
                            value={passenger.age}
                            onChange={(e) => handlePassengerChange(index, e)}
                            required
                            className="flex-1 p-2 border rounded"
                        />
                        <select
                            name="gender"
                            value={passenger.gender}
                            onChange={(e) => handlePassengerChange(index, e)}
                            required
                            className="flex-1 p-2 border rounded"
                        >
                            <option value="male">Male</option>
                            <option value="female">Female</option>
                            <option value="other">Other</option>
                        </select>
                        {passengers.length > 1 && (
                            <button type="button" onClick={() => handleRemovePassenger(index)} className="bg-red-500 text-white p-2 rounded">
                                Remove
                            </button>
                        )}
                    </div>
                ))}

                <button type="button" onClick={handleAddPassenger} className="bg-blue-500 text-white p-2 rounded mb-4" disabled={seatsBooked >= train.availableSeats}>
                    Add Another Passenger
                </button>

                <div className="text-xl font-bold mt-4">
                    Total Fare: ₹{train.fare * seatsBooked}
                </div>

                <button type="submit" className="bg-green-500 text-white p-4 rounded mt-4 w-full">
                    Proceed to Pay
                </button>
            </form>
        </div>
    );
};

export default Booking;