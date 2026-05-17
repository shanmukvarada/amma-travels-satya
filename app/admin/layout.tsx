'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const isAuth = localStorage.getItem('admin_auth');
    if (!isAuth) {
      router.push('/login');
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    router.push('/login');
  };

  if (!authorized) return null; // Or a loading spinner

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6">
          <Link href="/admin" className="text-xl font-bold tracking-tight text-gray-900">
            Amma Travels <span className="text-sm font-medium text-gray-500 block">Admin Portal</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 px-4 flex-1">
          <Link href="/admin" className="px-4 py-2 hover:bg-gray-100 rounded-md font-medium text-gray-700">Live Tracker</Link>
          <Link href="/admin/vehicles" className="px-4 py-2 hover:bg-gray-100 rounded-md font-medium text-gray-700">Vehicles</Link>
          <div className="my-4 border-t border-gray-200"></div>
          <Link href="/" className="px-4 py-2 hover:bg-gray-100 rounded-md font-medium text-blue-600">View Site</Link>
        </nav>
        <div className="p-4 mt-auto">
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 rounded-md font-medium text-sm">
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
