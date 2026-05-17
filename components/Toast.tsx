'use client';

import { useUIStore } from '@/store/uiStore';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';
import * as motion from 'motion/react-client';
import { AnimatePresence } from 'motion/react';

export function Toast() {
  const { showToast, toastMessage, toastType, hideToast } = useUIStore();

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  };

  const bgs = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  return (
    <AnimatePresence>
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-full border shadow-lg ${bgs[toastType]}`}
        >
          {icons[toastType]}
          <span className="font-medium text-sm text-gray-800">{toastMessage}</span>
          <button onClick={hideToast} className="p-1 hover:bg-black/5 rounded-full transition-colors ml-2">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
