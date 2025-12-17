'use client';

import { useRouter } from 'next/navigation';
import { useCheckAuth, useLogout } from '@/client/hooks/auth';

export default function DashboardPage() {
  const router = useRouter();
  const { data: authData, isLoading } = useCheckAuth();
  const logoutMutation = useLogout();

  if (isLoading) return <div>Loading...</div>;

  if (!authData?.authenticated) {
    router.push('/login');
    return null;
  }

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => router.push('/login'),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl mb-4">Dashboard</h1>
      <p>Welcome! You are logged in.</p>
      <button
        onClick={handleLogout}
        disabled={logoutMutation.isPending}
        className="mt-4 bg-red-500 text-white p-2 rounded"
      >
        {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );
}