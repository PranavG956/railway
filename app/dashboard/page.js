'use client'

import React from 'react'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import TrainCard from '@/components/TrainCard'


const Page = () => {
//   const dummyTrains = [
//   { id: 1, name: "Mumbai-Delhi Express", number: "12951", source: "Mumbai C", destination: "Delhi Junc", departure: "06:00:00", arrival: "22:00:00", availableSeats: 78, fare: "2000 (SL)" },
//   { id: 2, name: "Pune-Chennai Superfast", number: "11041", source: "Pune Junc", destination: "Chennai C", departure: "07:30:00", arrival: "20:00:00", availableSeats: 98, fare: "2000 (SL)" },
//   { id: 3, name: "Howrah-Mumbai Mail", number: "12321", source: "Howrah Junc", destination: "Mumbai C", departure: "05:00:00", arrival: "23:30:00", availableSeats: 138, fare: "2000 (SL)" },
//   { id: 4, name: "Delhi-Chennai Express", number: "12621", source: "Delhi Junc", destination: "Chennai C", departure: "06:45:00", arrival: "22:30:00", availableSeats: 100, fare: "2000 (SL)" },
//   { id: 5, name: "Pune-Howrah Duronto", number: "12221", source: "Pune Junc", destination: "Howrah Junc", departure: "05:30:00", arrival: "23:00:00", availableSeats: 110, fare: "2000 (SL)" },
//   { id: 6, name: "Mumbai-Chennai SF", number: "12163", source: "Mumbai C", destination: "Chennai C", departure: "08:00:00", arrival: "22:30:00", availableSeats: 92, fare: "2000 (SL)" },
// ];

  const { data: session, status } = useSession();
  const router = useRouter();
  const [source, setsource] = useState("")
  const [destination, setdestination] = useState("")
  const [alltrains, setalltrains] = useState([])
  const [filteredtrains, setfilteredtrains] = useState([])


  useEffect(() => {
    document.title = "Railinks - Dashboard";
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [session,router])
  

  useEffect(() => {
    const fetchTrains = async () => {
      const response = await fetch('/api/trains');
      const data = await response.json();
      setalltrains(data);
      setfilteredtrains(data);

      // setalltrains(dummyTrains);
      // setfilteredtrains(dummyTrains);
    };

    if (status === 'authenticated') {
      fetchTrains();
    }
  }, [status]);
  
  const handleRefresh = () =>{
    setsource("");
    setdestination("");
    setfilteredtrains(alltrains);
  }
  const handleSearch = (e) => {
    e.preventDefault();
    
    // Filter the full list of trains based on search criteria
    const filtered = alltrains.filter(train => {
      const sourceMatch = source ? train.source.toLowerCase().includes(source.toLowerCase()) : true;
      const destinationMatch = destination ? train.destination.toLowerCase().includes(destination.toLowerCase()) : true;
      return sourceMatch && destinationMatch;
    });
    setfilteredtrains(filtered);
  };
  return (
    <div className="min-h-[calc(100vh-88px)] bg-white flex flex-col items-center">
      <h1 className="text-3xl font-bold text-black">Metro Booking System</h1>
      <main className="container px-[5vw]">
        <div className="flex justify-start items-center mb-4 gap-4">
          <h2 className="text-2xl font-bold">Available Trains</h2>
          <button onClick={handleRefresh} className="cursor-pointer px-3 py-1 bg-blue-700 text-white rounded-lg hover:bg-blue-500 transition">Refresh</button>
        </div>
      <div className="bg-slate-300 px-4 py-3 rounded-lg">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row justify-center items-end gap-4">
          <div className="flex-1 w-full">
            <label htmlFor="source" className="pl-1">Source Station</label>
            <input onChange={(e)=>setsource(e.target.value)} className="w-full p-3 rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500" type="text" id="source" value={source} placeholder="Source Station" />
          </div>
          <div className="flex-1 w-full">
            <label htmlFor="source" className="pl-1">Destination Station</label>
            <input onChange={(e)=>setdestination(e.target.value)} className="w-full p-3 rounded-lg text-black bg-white focus:ring-2 focus:ring-blue-500" type="text" id="destination" value={destination} placeholder="Destination Station" />
          </div>
          <button type="submit" className="w-full md:w-auto cursor-pointer px-3 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition">Search</button>
        </form>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
            {filteredtrains.length > 0 ? (
              filteredtrains.map((train) => <TrainCard key={train.number} train={train} />)
            ) : (
              <p className="col-span-full text-center text-lg text-gray-500">No trains found. Try a different search.</p>
            )}
          </div>
      </main>

    </div>
  )
}

export default Page


