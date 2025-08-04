import React from 'react';
import connectDB from '@/db/connectDB';
import Train from '@/models/Train';
import Booking from '@/components/booking';
import { useSession } from 'next-auth/react';


export default async function TrainDetailsPage(props) {
  const { params } = await props;
  const { trainId } = await params;
  await connectDB();
  let train= await Train.findOne({number: trainId})
  if(!train) {
    return <div className='flex justify-center items-center min-h-[calc(100vh-155px)] sm:min-h-[calc(100vh-116px)] text-2xl font-bold'>404 | User Not Found</div>;
  }

  return (
    <>
    <Booking trainId={trainId} />
    </>
  );

}

export async function generateMetadata({ params }) {
  return {
    title : `Railinks - Booking`,
  }
}