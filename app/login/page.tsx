'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin, useGetCurrentUser, useGetCurrentOrganization, useGetCurrentOrganizationUnit } from '@/client/hooks/auth';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();
  const loginMutation = useLogin();
  const { refetch: refetchUser } = useGetCurrentUser();
  const { refetch: refetchOrganization } = useGetCurrentOrganization();
  const { refetch: refetchOrganizationUnit } = useGetCurrentOrganizationUnit();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    loginMutation.mutate(
      { identifier, password },
      {
        onSuccess: async () => {
          await refetchUser();
          await refetchOrganization();
          await refetchOrganizationUnit();
          router.push('/dashboard');
        },
        onError: (error) => console.error(error),
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4">Login</h2>
        {loginMutation.isError && <p className="text-red-500 mb-4">Login failed</p>}
        <input
          type="text"
          placeholder="Email or Username"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
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
        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="w-full bg-blue-500 text-white p-2 rounded"
        >
          {loginMutation.isPending ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}