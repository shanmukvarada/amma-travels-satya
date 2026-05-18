'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileText, PhoneCall, MapPin } from 'lucide-react';

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex justify-around items-center px-2 py-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] safe-area-pb">
      <Link href="/" className={`flex flex-col items-center justify-center p-2 min-w-[70px] ${pathname === '/' ? 'text-red-700 font-bold' : 'text-gray-500 font-medium'}`}>
        <div className={`p-1.5 rounded-full mb-1 ${pathname === '/' ? 'bg-red-50' : ''}`}>
          <Home size={20} />
        </div>
        <span className="text-[10px]">Home</span>
      </Link>
      
      <a href="tel:+919652520222" className="flex flex-col items-center justify-center p-2 min-w-[70px] text-gray-500 font-medium">
        <div className="p-1.5 rounded-full mb-1 hover:bg-gray-50 text-indigo-600">
          <PhoneCall size={20} className="text-red-600" />
        </div>
        <span className="text-[10px]">Call</span>
      </a>

      <a href="https://maps.app.goo.gl/q3ZU2kcDAiHGUJPo7?g_st=aw" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-2 min-w-[70px] text-gray-500 font-medium">
        <div className="p-1.5 rounded-full mb-1 hover:bg-gray-50">
          <MapPin size={20} className="text-blue-600" />
        </div>
        <span className="text-[10px]">Location</span>
      </a>
    </nav>
  );
}
