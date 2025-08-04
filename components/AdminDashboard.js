// components/AdminDashboard.js
'use client'

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { addTrain, deleteTrain, updateUserAdminStatus, fetchAllTrains, fetchAllUsers } from '@/app/actions/useractions';

const AdminDashboard = () => {
    const { data: session, status } = useSession();
    const [trains, setTrains] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newTrain, setNewTrain] = useState({
        name: '',
        number: '',
        source: '',
        destination: '',
        departure: '',
        arrival: '',
        availableSeats: 0,
        fare: '',
    });

    const isAdmin = session?.user?.role;
    const userEmail = session?.user?.email;

    const fetchAllData = async () => {
        if (isAdmin=='admin' && userEmail) {
            const allTrains = await fetchAllTrains();
            const allUsers = await fetchAllUsers();
            setTrains(allTrains);
            setUsers(allUsers);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (status === 'authenticated') {
            fetchAllData();
            console.log(userEmail)
        }
    }, [status, isAdmin, userEmail]);

    const handleAddTrain = async (e) => {
        e.preventDefault();
        const result = await addTrain(newTrain, userEmail);
        if (result.success) {
            alert(result.message);
            setNewTrain({
                name: '', number: '', source: '', destination: '',
                departure: '', arrival: '', availableSeats: 0, fare: '',
            });
            fetchAllData(); // Refresh the train list
        } else {
            alert(result.error);
        }
    };

    const handleDeleteTrain = async (trainId) => {
        const result = await deleteTrain(trainId, userEmail);
        if (result.success) {
            alert(result.message);
            fetchAllData(); // Refresh the train list
        } else {
            alert(result.error);
        }
    };

    const handleUpdateAdminStatus = async (userId, isAdminStatus) => {
        const result = await updateUserAdminStatus(userId, isAdminStatus, userEmail);
        if (result.success) {
            alert(result.message);
            fetchAllData(); // Refresh the user list
        } else {
            alert(result.error);
        }
    };

    if (status === 'loading' || loading) {
        return <div className="text-center text-xl p-8">Loading...</div>;
    }

    if (isAdmin!="admin") {
        return <div className="text-center text-xl text-red-500 p-8">Permission Denied: You are not an admin.</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Add New Train Section */}
            <div className="mb-8 p-6 bg-gray-100 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Add New Train</h2>
                <form onSubmit={handleAddTrain} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input type="text" placeholder="Train Name" value={newTrain.name} onChange={(e) => setNewTrain({ ...newTrain, name: e.target.value })} required className="p-2 border rounded" />
                    <input type="text" placeholder="Train Number" value={newTrain.number} onChange={(e) => setNewTrain({ ...newTrain, number: e.target.value })} required className="p-2 border rounded" />
                    <input type="text" placeholder="Source" value={newTrain.source} onChange={(e) => setNewTrain({ ...newTrain, source: e.target.value })} required className="p-2 border rounded" />
                    <input type="text" placeholder="Destination" value={newTrain.destination} onChange={(e) => setNewTrain({ ...newTrain, destination: e.target.value })} required className="p-2 border rounded" />
                    <input type="text" placeholder="Departure Time" value={newTrain.departure} onChange={(e) => setNewTrain({ ...newTrain, departure: e.target.value })} required className="p-2 border rounded" />
                    <input type="text" placeholder="Arrival Time" value={newTrain.arrival} onChange={(e) => setNewTrain({ ...newTrain, arrival: e.target.value })} required className="p-2 border rounded" />
                    <input type="number" placeholder="Available Seats" value={newTrain.availableSeats} onChange={(e) => setNewTrain({ ...newTrain, availableSeats: parseInt(e.target.value) || 0 })} required className="p-2 border rounded" />
                    <input type="text" placeholder="Fare" value={newTrain.fare} onChange={(e) => setNewTrain({ ...newTrain, fare: e.target.value })} required className="p-2 border rounded" />
                    <button type="submit" className="md:col-span-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600">Add Train</button>
                </form>
            </div>

            {/* Manage Trains Section */}
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Manage Trains</h2>
                <div className="space-y-4">
                    {trains.map((train) => (
                        <div key={train.id} className="flex justify-between items-center p-4 border rounded-lg shadow-sm">
                            <div>
                                <h3 className="font-medium">{train.name} ({train.number})</h3>
                                <p className="text-gray-600">{train.source} to {train.destination}</p>
                            </div>
                            <button onClick={() => handleDeleteTrain(train.id)} className="bg-red-500 text-white p-2 rounded hover:bg-red-600">Delete</button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Manage Users Section */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
                <div className="space-y-4">
                    {users.map((user) => (
                        <div key={user.id} className="flex justify-between items-center p-4 border rounded-lg shadow-sm">
                            <div>
                                <h3 className="font-medium">{user.username}</h3>
                                <p className="text-gray-600">{user.email}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span>Admin:</span>
                                <input
                                    type="checkbox"
                                    checked={user.is_admin}
                                    onChange={(e) => handleUpdateAdminStatus(user.id, e.target.checked)}
                                    className="h-5 w-5"
                                    disabled={user.email === userEmail} // Prevent changing own admin status
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;