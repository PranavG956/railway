'use client'

import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function Home() {
    const { data: session, status } = useSession();
  const router = useRouter()
  return (
    <div className="min-h-[calc(100vh-88px)] bg-white flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-4">Metro Booking System</h1>
      <p className="text-lg text-gray-600 mb-8">Book your metro tickets easily and quickly online.</p>
      <div className="flex gap-4">
        <button onClick={()=>{router.push("/about")}} className="cursor-pointer px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">More</button>
        <button onClick={()=>{router.push(session ? "/dashboard" : "/login")}} className="cursor-pointer px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">Get Started</button>
      </div>
    </div>
  );
}
