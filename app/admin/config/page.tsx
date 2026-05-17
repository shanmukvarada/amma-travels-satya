'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { BusinessConfig } from '@/lib/types';
import { ToastAction } from '@radix-ui/react-toast'; // Not strictly needed unless using shadcn toasts, let's keep it simple

export default function ConfigPage() {
  const [config, setConfig] = useState<BusinessConfig>({
    companyName: 'Amma Travels',
    phone: '9652520222',
    address: 'Kakinada',
    alertBanner: '',
    extraFeePerKm: 10,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadConfig() {
      const docRef = doc(db, 'config', 'global');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setConfig(docSnap.data() as BusinessConfig);
      }
      setLoading(false);
    }
    loadConfig();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'config', 'global'), config);
      alert('Config saved successfully');
    } catch (error) {
      console.error(error);
      alert('Error saving config');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Business Configuration</h1>
      <form onSubmit={handleSave} className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
          <input 
            type="text" 
            value={config.companyName} 
            onChange={e => setConfig({...config, companyName: e.target.value})}
            className="w-full border border-gray-300 rounded-md p-2" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input 
            type="text" 
            value={config.phone} 
            onChange={e => setConfig({...config, phone: e.target.value})}
            className="w-full border border-gray-300 rounded-md p-2" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input 
            type="text" 
            value={config.address} 
            onChange={e => setConfig({...config, address: e.target.value})}
            className="w-full border border-gray-300 rounded-md p-2" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Alert Banner (optional)</label>
          <textarea 
            value={config.alertBanner || ''} 
            onChange={e => setConfig({...config, alertBanner: e.target.value})}
            className="w-full border border-gray-300 rounded-md p-2" 
            rows={3} 
            placeholder="e.g. 10% off on weekend rentals!"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Extra Fee Per KM (₹)</label>
          <input 
            type="number" 
            value={config.extraFeePerKm} 
            onChange={e => setConfig({...config, extraFeePerKm: Number(e.target.value)})}
            className="w-full border border-gray-300 rounded-md p-2" 
            required 
          />
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>

      </form>
    </div>
  );
}
