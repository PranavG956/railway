// app/profile/[username]/page.js
import React from 'react';
import { fetchUserByUsername, fetchUserBookings } from '@/app/actions/useractions';

export default async function UserProfilePage(props) {
    const { params } = await props;
    const { username } = await params;

    // Fetch the user to get their ID
    const user = await fetchUserByUsername(username);

    if (!user) {
        return (
            <div className='flex justify-center items-center min-h-[calc(100vh-155px)] sm:min-h-[calc(100vh-116px)] text-2xl font-bold'>
                404 | User Not Found
            </div>
        );
    }

    // Fetch all bookings for the user using their ID
    const bookings = await fetchUserBookings(user.id);

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Bookings for {user.username}</h1>

            {bookings.length === 0 ? (
                <div className="text-center text-xl text-gray-500">
                    No bookings found.
                </div>
            ) : (
                <div className="space-y-6">
                    {bookings.map((booking) => (
                        <div key={booking.id} className="border p-6 rounded-lg shadow-md bg-white">
                            <div className="flex justify-between items-center border-b pb-4 mb-4">
                                <h2 className="text-xl font-semibold">
                                    Booking on Train {booking.trainId.name} ({booking.trainId.number})
                                </h2>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    booking.status === 'paid' ? 'bg-green-100 text-green-800' :
                                    booking.status === 'created' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {booking.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <p className="text-gray-700"><strong>PNR:</strong> {booking.pnrNumber}</p>
                                <p className="text-gray-700"><strong>Total Fare:</strong> ₹{booking.totalFare}</p>
                                <p className="text-gray-700"><strong>Seats Booked:</strong> {booking.seatsBooked}</p>
                                <p className="text-gray-700"><strong>Departure:</strong> {booking.trainId.departure} from {booking.trainId.source}</p>
                                <p className="text-gray-700"><strong>Arrival:</strong> {booking.trainId.arrival} at {booking.trainId.destination}</p>
                            </div>
                            <div className="mt-4">
                                <h3 className="text-lg font-medium mb-2">Passengers:</h3>
                                <ul className="list-disc list-inside space-y-1">
                                    {booking.passengers.map((passenger, index) => (
                                        <li key={index} className="text-gray-600">
                                            {passenger.name} ({passenger.age}, {passenger.gender})
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export async function generateMetadata({ params }) {
  return {
    title : `Railinks - Profile - ${params.username}`,
  }
}