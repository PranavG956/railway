import connectDB from '@/db/connectDB';
import User from '@/models/Users';
import { NextResponse } from 'next/server';

export async function POST(req) {
  await connectDB();

  try {
    const { username, email, password } = await req.json();

    // Check if user already exists by username or email
    const check = await User.findOne({ $or: [{ username }, { email }] });
    if (check) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 } // 409 Conflict status
      );
    }

    // Create the new user
    const user = await User.create({
      username,
      email,
      password,
      is_admin: false, // Default to a non-admin user
    });

    // You can choose to automatically sign in the user here if you want
    // by generating a JWT token, but we'll leave that for the login page
    // for simplicity.

    return NextResponse.json(
      { message: 'User created successfully', user: { id: user._id, username: user.username, email: user.email } },
      { status: 201 } // 201 Created status
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 } // 500 Internal Server Error
    );
  }
}