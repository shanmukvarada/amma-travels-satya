import { create } from 'zustand';
import { User } from 'firebase/auth';

interface AuthState {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  setAuth: (user: User | null, isAdmin: boolean) => void;
  setLoading: (isLoading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAdmin: false,
  isLoading: true,
  setAuth: (user, isAdmin) => set({ user, isAdmin, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}));
