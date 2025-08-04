import connectDB from '@/db/connectDB';
import Train from '@/models/Train';
import { NextResponse } from 'next/server';

    export async function GET() {
      await connectDB();
      
      try {
        const trains = await Train.find({});
        return NextResponse.json(trains, { status: 200 });
      } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch trains' }, { status: 500 });
      }
    }
    