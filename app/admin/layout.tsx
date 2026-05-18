'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Car, FileText } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
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

  if (!authorized) return <div className="min-h-screen bg-gray-50"></div>;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Mobile Top Header */}
      <header className="md:hidden bg-gray-950 sticky top-0 z-40 px-4 py-3 flex items-center justify-between shadow-sm">
        <Link href="/admin" className="flex items-center gap-2">
          <img src="/logo.png" alt="Amma Travels" className="h-10 w-auto object-contain" />
          <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-1">Admin</span>
        </Link>
        <button onClick={handleLogout} className="text-gray-400 p-2 hover:bg-gray-800 hover:text-white rounded-full transition-colors">
          <LogOut size={20} />
        </button>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-white border-r border-gray-200 flex-col shadow-sm z-10 sticky top-0 h-screen">
        <div className="p-4 bg-gray-950 flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-3">
            <img src="/logo.png" alt="Amma Travels" className="h-10 w-auto object-contain" />
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-2">Admin</span>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 px-4 flex-1 mt-4">
          <Link href="/admin" className={`px-4 py-2.5 flex items-center gap-3 rounded-lg font-medium transition-colors ${pathname === '/admin' ? 'bg-red-50 text-red-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
            <Car size={18} /> Inventory
          </Link>
        </nav>
        <div className="p-4 mt-auto border-t border-gray-100">
          <Link href="/" className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-gray-500 hover:text-gray-900 rounded-lg font-medium text-sm mb-2 transition-colors">
            <FileText size={18} /> View Site
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 w-full text-left px-4 py-2.5 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg font-medium text-sm transition-colors">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-10 md:max-h-screen md:overflow-y-auto w-full max-w-6xl mx-auto">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 flex justify-around items-center px-2 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-area-pb">
        <Link href="/admin" className={`flex flex-col items-center justify-center p-2 min-w-[70px] ${pathname === '/admin' ? 'text-red-700 font-bold' : 'text-gray-500 font-medium'}`}>
          <div className={`p-1.5 rounded-full mb-1 ${pathname === '/admin' ? 'bg-red-50' : ''}`}>
            <Car size={20} />
          </div>
          <span className="text-[10px]">Inventory</span>
        </Link>
        <Link href="/" className="flex flex-col items-center justify-center p-2 min-w-[70px] text-gray-500 font-medium">
          <div className="p-1.5 rounded-full mb-1 hover:bg-gray-50">
            <FileText size={20} />
          </div>
          <span className="text-[10px]">Site</span>
        </Link>
      </nav>
    </div>
  );
}
