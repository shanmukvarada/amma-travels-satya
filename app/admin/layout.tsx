'use client';

import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { LayoutDashboard, Car, CalendarCheck, LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAdmin, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push('/admin/login');
    }
  }, [isLoading, isAdmin, router]);

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading Admin...</div>;
  if (!isAdmin) return null;

  return (
    <div className="flex bg-gray-50 min-h-[calc(100vh-80px)]">
      <aside className="w-64 bg-primary text-white hidden md:flex flex-col border-t border-white/10">
        <div className="p-6">
          <h2 className="text-xl font-heading font-bold opacity-80">Dashboard</h2>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/admin" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Overview
          </Link>
          <Link href="/admin/vehicles" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <Car className="w-5 h-5 mr-3" /> Vehicles
          </Link>
          <Link href="/admin/bookings" className="flex items-center px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all">
            <CalendarCheck className="w-5 h-5 mr-3" /> Bookings
          </Link>
        </nav>
        
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => signOut(auth)}
            className="flex items-center w-full px-4 py-3 text-red-300 hover:text-white hover:bg-red-500/20 rounded-xl transition-all"
          >
            <LogOut className="w-5 h-5 mr-3" /> Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto bg-gray-50">
        {children}
      </main>
    </div>
  );
}
