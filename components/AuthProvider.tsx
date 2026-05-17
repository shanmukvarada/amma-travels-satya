'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const isAdmin = user.email === 'shanmukvarada@gmail.com';
        setAuth(user, isAdmin);
      } else {
        setAuth(null, false);
      }
    });

    return () => unsubscribe();
  }, [setAuth]);

  return <>{children}</>;
}
