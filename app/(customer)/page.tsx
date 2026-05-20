 'use client';

import { useState, useEffect } from 'react';
import { Vehicle } from '@/lib/types';
import Link from 'next/link';
import { PhoneCall, Users, Fuel, Calendar, Loader2 } from 'lucide-react';
import Image from 'next/image';

import ImageSlider from '@/components/ImageSlider';

export default function HomePage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Car' | 'Bike'>('All');

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/vehicles');
        const data = await res.json();
        const available = (Array.isArray(data) ? data : []).filter((v: any) => v.status === 'Available');
        setVehicles(available as Vehicle[]);
      } catch (err) {
        console.error("Failed to load vehicles", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const filteredVehicles = vehicles.filter(v => filter === 'All' || v.type === filter);

  return (
    <main>
      <section className="mb-10 text-center md:text-left">
        <h1 className="font-display text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
          Explore Kakinada<br/>with <span className="text-red-700">Premium Rentals</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto md:mx-0">
          Top-quality self-drive cars and bikes at affordable prices. Enjoy your local trips or outstation tours.
        </p>
      </section>

      {/* Filter Options */}
      <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-xl inline-flex">
        {['All', 'Car', 'Bike'].map(t => (
          <button
            key={t}
            onClick={() => setFilter(t as any)}
            className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${filter === t ? 'bg-white text-red-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-red-600" size={32} />
        </div>
      ) : filteredVehicles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
          <p className="text-gray-500">No available vehicles matching this category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVehicles.map(vehicle => (
            <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all hover:border-red-200 flex flex-col">
              <div className="relative h-48 w-full bg-gray-100 flex-shrink-0 z-0">
                <ImageSlider images={vehicle.images} alt={vehicle.name} />
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 text-xs font-bold rounded-lg text-gray-800 z-10">
                  {vehicle.type}
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-1 text-red-600 font-semibold text-xs tracking-wider uppercase">{vehicle.model}</div>
                <h3 className="font-display font-bold text-xl text-gray-900 mb-3">{vehicle.name}</h3>
                
                <div className="grid grid-cols-3 gap-2 mt-auto pt-4 border-t border-gray-100 text-xs text-gray-600">
                  <div className="flex flex-col items-center gap-1"><Users size={16} /> <span>{vehicle.seatingCapacity} seats</span></div>
                  <div className="flex flex-col items-center gap-1"><Fuel size={16} /> <span>{vehicle.fuelType}</span></div>
                  <div className="flex flex-col items-center gap-1"><Calendar size={16} /> <span>{vehicle.year}</span></div>
                </div>
              </div>
              <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 font-bold text-red-600 text-center group-hover:bg-red-600 group-hover:text-white transition-colors">
                Book Now
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
