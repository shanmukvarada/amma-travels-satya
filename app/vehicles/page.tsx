'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getVehicles, Vehicle } from '@/lib/db';
import { Filter, Users, Fuel, Settings, Zap } from 'lucide-react';
import * as motion from 'motion/react-client';

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'car' | 'bike'>('all');

  useEffect(() => {
    getVehicles().then((data) => {
      setVehicles(data);
      setLoading(false);
    });
  }, []);

  const filtered = vehicles.filter(v => filter === 'all' || v.type === filter);

  return (
    <div className="w-full bg-gray-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-heading font-bold text-primary mb-2">Our Fleet</h1>
            <p className="text-gray-500">Choose from our perfectly maintained cars and bikes.</p>
          </div>
          
          <div className="flex bg-white p-1.5 rounded-full border border-gray-200 shadow-sm">
            {['all', 'car', 'bike'].map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t as any)}
                className={`px-6 py-2 rounded-full text-sm font-semibold capitalize transition-all ${filter === t ? 'bg-primary text-white shadow-md' : 'text-gray-600 hover:text-primary hover:bg-gray-50'}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-white rounded-3xl h-96 border border-gray-100"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filtered.map((vehicle, i) => (
              <motion.div 
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-all flex flex-col group"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                  <Image 
                    src={vehicle.images?.[0] || `https://picsum.photos/seed/${vehicle.id}/800/600`}
                    alt={vehicle.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md ${vehicle.isAvailable ? 'bg-white/90 text-green-700 shadow-sm' : 'bg-red-500/90 text-white shadow-sm'}`}>
                      {vehicle.isAvailable ? 'Available' : 'Booked'}
                    </span>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-heading font-bold text-xl text-primary">{vehicle.brand} {vehicle.model}</h3>
                      <p className="text-gray-500 text-sm">{vehicle.name}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-2xl text-accent">₹{vehicle.pricePerDay}</div>
                      <div className="text-xs text-gray-500 uppercase tracking-wide">per day</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 py-4 mt-auto mb-4 border-t border-gray-100">
                    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-xl">
                      <Users className="w-4 h-4 text-gray-500 mb-1" />
                      <span className="text-[10px] uppercase font-bold text-gray-600">{vehicle.seatingCapacity} Seats</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-xl">
                      <Settings className="w-4 h-4 text-gray-500 mb-1" />
                      <span className="text-[10px] uppercase font-bold text-gray-600">{vehicle.transmission}</span>
                    </div>
                    <div className="flex flex-col items-center justify-center p-2 bg-gray-50 rounded-xl">
                      <Fuel className="w-4 h-4 text-gray-500 mb-1" />
                      <span className="text-[10px] uppercase font-bold text-gray-600">{vehicle.fuelType}</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/vehicles/${vehicle.id}`} 
                    className="w-full py-3 rounded-xl bg-primary text-white text-center font-semibold hover:bg-primary-dark transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        )}
        
        {!loading && filtered.length === 0 && (
          <div className="text-center py-32">
            <Zap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-heading font-bold text-primary mb-2">No vehicles found</h3>
            <p className="text-gray-500">We don&apos;t have any {filter}s available right now.</p>
          </div>
        )}
      </div>
    </div>
  );
}
