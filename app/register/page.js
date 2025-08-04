'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    document.title="Railinks - Register";
  }, [])
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        return;
      }

      // Registration successful, redirect to login page
      router.push('/login');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-88px)] bg-white text-gray-900">
      <div className="p-8 rounded-xl shadow-2xl w-96 bg-slate-300">
        <h1 className="text-3xl font-bold mb-6 text-center">Register</h1>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium" htmlFor="username">Username</label>
            <input onChange={(e) => setUsername(e.target.value)} type="text" id="username" value={username} className="w-full p-2 rounded-lg bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium" htmlFor="email">Email</label>
            <input onChange={(e) => setEmail(e.target.value)}  type="email" id="email" value={email} className="w-full p-2 rounded-lg bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
          </div>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium" htmlFor="password">Password</label>
            <input onChange={(e) => setPassword(e.target.value)} type="password" id="password" value={password} className="w-full p-2 rounded-lg bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium" htmlFor="confirmPassword">Confirm Password</label>
            <input onChange={(e) => setConfirmPassword(e.target.value)} type="password" id="confirmPassword" value={confirmPassword} className="w-full p-2 rounded-lg bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
          </div>
          <button type="submit" className="w-full p-3 text-white bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition-colors">Sign Up</button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}