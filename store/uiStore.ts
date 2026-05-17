import { create } from 'zustand';

interface UIState {
  showToast: boolean;
  toastMessage: string;
  toastType: 'success' | 'error' | 'info';
  setToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  showToast: false,
  toastMessage: '',
  toastType: 'info',
  setToast: (message, type = 'info') => {
    set({ showToast: true, toastMessage: message, toastType: type });
    setTimeout(() => set({ showToast: false }), 4000);
  },
  hideToast: () => set({ showToast: false }),
}));
