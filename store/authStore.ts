import { create } from 'zustand';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthState {
  isAdmin: boolean;
  isLoading: boolean;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAdmin: false,
  isLoading: true,
  checkAuth: () => {
    onAuthStateChanged(auth, (user) => {
      set({ isAdmin: !!user && user.email === 'admin@ammatravels.com', isLoading: false });
    });
  }
}));
