import React from 'react'
import Link from 'next/link';

const TrainCard = ({ train }) => {
  return (
    <div className="bg-blue-200 p-6 rounded-xl shadow-lg flex flex-col justify-between transition-transform transform hover:scale-105 duration-300">
      <h3 className="text-xl font-bold text-blue-600">{train.name}</h3>
      <p className="text-sm text-gray-700 mb-2">{train.number}</p>
      <div className="text-gray-800 mb-4">
        <p className="text-sm">{train.source} → {train.destination}</p>
        <p className="text-sm">Dep: {train.departure} | Arr: {train.arrival}</p>
      </div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-300">
          <span className="text-green-500">{train.availableSeats}</span> seats left
        </p>
        <p className="text-lg font-semibold text-green-600">₹{train.fare}</p>
      </div>
      <Link 
        href={`/trains/${train.number}`}
        className="w-full text-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        View Details
      </Link>
    </div>
  );
};

export default TrainCard
