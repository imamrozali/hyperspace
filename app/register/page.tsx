'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/client/hooks/auth';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [brandName, setBrandName] = useState('');
  const router = useRouter();
  const registerMutation = useRegister();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    registerMutation.mutate(
      { email, username, password, brandName },
      {
        onSuccess: () => router.push('/dashboard'),
        onError: (error) => console.error(error),
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4">Register</h2>
        {registerMutation.isError && <p className="text-red-500 mb-4">Registration failed</p>}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border mb-4"
          required
        />
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 border mb-4"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border mb-4"
          required
        />
        <input
          type="text"
          placeholder="Brand Name"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          className="w-full p-2 border mb-4"
          required
        />
        <button
          type="submit"
          disabled={registerMutation.isPending}
          className="w-full bg-green-500 text-white p-2 rounded"
        >
          {registerMutation.isPending ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}