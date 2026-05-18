'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { Mail, User as UserIcon, Calendar, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      if (u) {
        setUser(u);
      } else {
        router.push('/');
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-t-red-600 border-red-200 animate-spin"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <main className="max-w-xl mx-auto">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-red-600 mb-6">
        <ArrowLeft size={16} className="mr-1" /> Back to Home
      </Link>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gray-950 px-8 py-6 relative">
          <div className="absolute -bottom-12 left-8 p-1 bg-white rounded-full">
            <img 
              src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} 
              alt="avatar" 
              className="w-24 h-24 rounded-full border-2 border-white object-cover shadow-sm bg-gray-100" 
            />
          </div>
        </div>
        
        <div className="px-8 pt-16 pb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{user.displayName || 'Traveler'}</h1>
          <p className="text-gray-500 text-sm mb-8 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
            Logged in
          </p>

          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="bg-white p-2.5 rounded-xl shadow-sm text-gray-400">
                <UserIcon size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5 tracking-wider">Full Name</p>
                <p className="text-gray-900 font-medium">{user.displayName || 'Not Provided'}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="bg-white p-2.5 rounded-xl shadow-sm text-gray-400">
                <Mail size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5 tracking-wider">Email Address</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
              <div className="bg-white p-2.5 rounded-xl shadow-sm text-gray-400">
                <Calendar size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-0.5 tracking-wider">Account Created</p>
                <p className="text-gray-900 font-medium">{user.metadata.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric'}) : 'Unknown'}</p>
              </div>
            </div>
            
            <div className="mt-8">
               <button onClick={() => auth.signOut()} className="w-full py-3.5 bg-red-50 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition shadow-sm border border-red-100">
                 Sign Out of Amma Travels
               </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
