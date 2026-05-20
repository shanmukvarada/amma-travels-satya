 'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';

export default function UserMenu() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if user has complete profile
      try {
        const resp = await fetch(`/api/users?uid=${encodeURIComponent(user.uid)}`);
        if (!resp.ok) {
          router.push('/profile?edit=true');
        } else {
          const data = await resp.json();
          if (!data.phone || !data.address) router.push('/profile?edit=true');
        }
      } catch (e) {
        // If the users API fails, redirect to profile to be safe
        router.push('/profile?edit=true');
      }
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  if (loading) return <div className="h-8 w-8 animate-pulse bg-gray-800 rounded-full"></div>;

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <div className="text-xs text-gray-300 font-medium">{user.displayName}</div>
          <button onClick={handleLogout} className="text-[10px] text-red-400 hover:text-red-300 transition">Logout</button>
        </div>
        <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="avatar" className="h-8 w-8 rounded-full border border-gray-700 cursor-pointer" onClick={() => window.location.href = '/profile'} />
      </div>
    );
  }

  return (
    <button 
      onClick={handleLogin}
      className="bg-white/10 hover:bg-white/20 text-white text-xs font-semibold px-4 py-2 rounded-full transition-colors flex items-center gap-2"
    >
      <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="G" />
      Sign in
    </button>
  );
}
