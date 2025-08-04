'use client'; // This component will run on the client side

import { useState, useEffect } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Page() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    document.title="Railinks - Login";
  }, [])
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await signIn('credentials', {
      redirect: false,
      email,
      password
    });

    if (result?.error) {
      setError('Invalid email or password.');
    } else {
      // If login is successful, redirect to the dashboard
      router.push('/dashboard');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-88px)] bg-white text-gray-900">
      <div className="p-8 rounded-xl shadow-2xl w-96 bg-slate-300">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit}>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium" htmlFor="email">Email</label>
            <input onChange={(e) => setEmail(e.target.value)} type="email" id="email" value={email}  className="w-full p-2 rounded-lg bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" required/>
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium" htmlFor="password">Password</label>
            <input onChange={(e) => setPassword(e.target.value)} type="password" id="password" value={password} className="w-full p-2 rounded-lg bg-gray-200 text-black focus:outline-none focus:ring-2 focus:ring-blue-500" required />
          </div>
          <button type="submit" className="cursor-pointer w-full p-3 text-white bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition-colors">Sign In</button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-blue-900 hover:underline cursor-pointer">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}


export const metadata = {
  title: "Railinks - Login",
};