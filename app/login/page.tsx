'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '123456') { // Fixed PIN for simple environment auth
      localStorage.setItem('admin_auth', 'true');
      router.push('/admin');
    } else {
      setError('Invalid PIN');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-sm w-full text-center">
        <h1 className="text-2xl font-bold mb-2">Admin Login</h1>
        <p className="text-gray-500 text-sm mb-6">Enter the admin PIN to access the dashboard. (Hint: 123456)</p>
        
        <input 
          type="password" 
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="Enter PIN"
          className="w-full text-center tracking-widest border border-gray-300 rounded-lg p-3 mb-4 text-xl focus:outline-none focus:ring-2 focus:ring-red-600"
        />
        
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        
        <button 
          type="submit"
          className="w-full bg-red-600 text-white font-bold py-3 rounded-lg hover:bg-red-700 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
}
