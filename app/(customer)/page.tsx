'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { Vehicle, BusinessConfig } from '@/lib/types';
import Link from 'next/link';

export default function CustomerHomepage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [config, setConfig] = useState<BusinessConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filter States
  const [filterType, setFilterType] = useState<'All' | 'Car' | 'Bike'>('All');

  useEffect(() => {
    async function init() {
      // Load config
      const confSnap = await getDoc(doc(db, 'config', 'global'));
      let businessConfig = null;
      if (confSnap.exists()) {
        businessConfig = confSnap.data() as BusinessConfig;
        setConfig(businessConfig);
      }

      // Load vehicles
      const querySnapshot = await getDocs(collection(db, 'vehicles'));
      const data: Vehicle[] = [];
      querySnapshot.forEach((doc) => {
        const v = { id: doc.id, ...doc.data() } as Vehicle;
        if (v.status !== 'Maintenance') {
          data.push(v);
        }
      });
      setVehicles(data);
      setLoading(false);
    }
    init();
  }, []);

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50 text-gray-400">Loading Amma Travels...</div>
  );

  const filteredVehicles = vehicles.filter(v => filterType === 'All' || v.type === filterType);

  return (
    <div className="pb-24">
      {/* Alert Banner */}
      {config?.alertBanner && (
        <div className="bg-indigo-600 text-white text-center py-2 px-4 text-sm font-medium">
          {config.alertBanner}
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-black tracking-tight text-gray-900">{config?.companyName || 'Amma Travels'}</h1>
            <p className="text-xs text-gray-500 font-medium">{config?.address}</p>
          </div>
          <Link href={`tel:${config?.phone}`} className="bg-green-600 text-white p-2 rounded-full shadow-lg flex items-center justify-center shrink-0 w-10 h-10">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pt-6">
        <h2 className="text-2xl font-bold mb-4">Choose Your Ride</h2>
        
        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {['All', 'Car', 'Bike'].map((type) => (
            <button 
              key={type}
              onClick={() => setFilterType(type as any)}
              className={`px-6 py-2 rounded-full font-medium whitespace-nowrap transition-colors ${filterType === type ? 'bg-indigo-600 text-white shadow-md' : 'bg-white border text-gray-600' }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Vehicles Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map(v => (
            <Link key={v.id} href={`/vehicles/${v.id}`} className="block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-[4/3] bg-gray-200 relative">
                {v.images && v.images.length > 0 ? (
                  <img src={v.images[0]} alt={v.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
                )}
                {v.status === 'Booked' && (
                  <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                    <span className="bg-gray-900 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">Currently Booked</span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{v.name}</h3>
                    <p className="text-sm text-gray-500">{v.model} • {v.year}</p>
                  </div>
                  {/* Min Price Badge */}
                  {v.pricingTiers && v.pricingTiers.length > 0 && (
                     <div className="text-right">
                       <span className="text-xs text-gray-500 block">Starts from</span>
                       <span className="font-bold text-indigo-600 tracking-tight">₹{Math.min(...v.pricingTiers.map(t=>t.price))}</span>
                     </div>
                  )}
                </div>
                
                <div className="flex gap-3 text-xs text-gray-600 bg-gray-50 p-2 rounded-lg">
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    {v.fuelType}
                  </div>
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    {v.seatingCapacity} Seats
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {filteredVehicles.length === 0 && (
          <div className="py-12 text-center text-gray-500">
            No {filterType !== 'All' ? filterType.toLowerCase() + 's' : 'vehicles'} available right now.
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="mt-12 border-t border-gray-200 py-8 text-center text-sm text-gray-500 pb-28 sm:pb-8">
        <p>© {new Date().getFullYear()} {config?.companyName || 'Amma Travels'}. All rights reserved.</p>
        <div className="mt-4">
          <Link href="/login" className="text-indigo-600 font-medium hover:underline">Admin Login</Link>
        </div>
      </footer>
      
      {/* Sticky Bottom Call Button for Mobile */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 flex justify-center pb-8 sm:hidden">
        <Link href={`tel:${config?.phone}`} className="bg-indigo-600 text-white w-full max-w-sm rounded-full py-4 font-bold text-center shadow-indigo shadow-lg flex items-center justify-center gap-2">
          Call Amma Travels
        </Link>
      </div>

    </div>
  );
}
