'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Menu, X, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-primary text-white rounded-lg flex items-center justify-center font-heading font-bold text-xl">
              AT
            </div>
            <span className="font-heading font-bold text-2xl tracking-tight text-primary">Amma Travels</span>
          </Link>
          
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/" className="text-sm font-medium text-gray-600 hover:text-accent transition-colors">Home</Link>
            <Link href="/vehicles" className="text-sm font-medium text-gray-600 hover:text-accent transition-colors">Vehicles</Link>
            <Link href="/contact" className="text-sm font-medium text-gray-600 hover:text-accent transition-colors">Contact</Link>
            {isAdmin && (
              <Link href="/admin" className="text-sm font-medium text-accent hover:text-primary transition-colors">Admin Dashboard</Link>
            )}
          </nav>
          
          <div className="hidden md:flex items-center space-x-4">
            <a href="tel:9652520222" className="text-sm font-bold text-primary">
              +91 96525 20222
            </a>
            {user ? (
              <Link href={isAdmin ? "/admin" : "/profile"} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                <User className="w-5 h-5 text-gray-700" />
              </Link>
            ) : (
              <Link href="/admin/login" className="px-5 py-2.5 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors">
                Admin Login
              </Link>
            )}
          </div>

          <button 
            className="md:hidden p-2 rounded-lg bg-gray-50 text-primary"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white border-b border-gray-100">
          <div className="flex flex-col px-4 pt-2 pb-6 space-y-4">
            <Link href="/" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-600">Home</Link>
            <Link href="/vehicles" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-600">Vehicles</Link>
            <Link href="/contact" onClick={() => setIsOpen(false)} className="text-lg font-medium text-gray-600">Contact</Link>
            {isAdmin && (
              <Link href="/admin" onClick={() => setIsOpen(false)} className="text-lg font-medium text-accent">Admin Dashboard</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
