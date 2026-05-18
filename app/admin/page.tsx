'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, getDocs, doc, updateDoc, setDoc, addDoc, getDoc } from 'firebase/firestore';
import { Booking, Vehicle } from '@/lib/types';
import { Phone, CheckCircle, RotateCcw, Loader2, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'bookings'));
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setBookings(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const seedData = async () => {
    if (!confirm('Seed database?')) return;
    try {
      setLoading(true);
      // Car
      await addDoc(collection(db, 'vehicles'), {
        name: 'Swift Dzire', model: 'VXI', type: 'Car', year: 2022, fuelType: 'Petrol', seatingCapacity: 4,
        description: 'A comfortable and reliable sedan perfect for city tours and outstation trips.',
        images: ['https://picsum.photos/seed/dzire/800/600'], status: 'Available',
        extraKmFee: 12, pricingTiers: [{ id: '1', hours: 12, price: 1500, kmLimit: 150 }]
      });
      // Bike
      await addDoc(collection(db, 'vehicles'), {
        name: 'Royal Enfield Classic', model: '350cc', type: 'Bike', year: 2021, fuelType: 'Petrol', seatingCapacity: 2,
        description: 'Classic cruiser bike for adventurous rides. Enjoy the thumper.',
        images: ['https://picsum.photos/seed/enfield/800/600'], status: 'Available',
        extraKmFee: 5, pricingTiers: [{ id: '1', hours: 12, price: 800, kmLimit: 100 }]
      });
      alert('Data seeded');
      loadData();
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  const approveBooking = async (b: Booking) => {
    if (!b.id) return;
    await updateDoc(doc(db, 'bookings', b.id), { status: 'Approved' });
    loadData();
  };
  
  const activateBooking = async (b: Booking) => {
    if (!b.id) return;
    await updateDoc(doc(db, 'bookings', b.id), { status: 'Active' });
    await updateDoc(doc(db, 'vehicles', b.vehicleId), { status: 'Booked' });
    loadData();
  };

  const markReturned = async (b: Booking) => {
    if (!b.id) return;
    await updateDoc(doc(db, 'bookings', b.id), { status: 'Returned', endDate: new Date().toISOString() });
    await updateDoc(doc(db, 'vehicles', b.vehicleId), { status: 'Available' });
    loadData();
  };

  const pending = bookings.filter(b => b.status === 'Pending' || b.status === 'Approved');
  const active = bookings.filter(b => b.status === 'Active');

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" size={32} /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900">Live Operations Pipeline</h1>
        <button onClick={loadData} className="px-4 py-2 border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium">Refresh</button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Pending & Approved Column */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-900 border-b-2 border-red-600 pb-1">New Requests</h2>
            <span className="bg-red-100 text-red-800 text-xs font-bold px-2 py-0.5 rounded-full">{pending.length}</span>
          </div>
          
          <div className="space-y-4">
            {pending.length === 0 && <p className="text-gray-500 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">No pending requests.</p>}
            {pending.map(b => (
              <div key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg">{b.customerName}</h3>
                    <p className="text-sm text-gray-500 font-medium">{b.vehicleName} &bull; ₹{b.totalPrice}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-md ${b.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'}`}>
                    {b.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <a href={b.aadharUrl} target="_blank" className="text-red-600 hover:underline border border-red-100 bg-red-50 px-2 py-1.5 rounded text-center">View Aadhaar</a>
                  <a href={b.dlUrl} target="_blank" className="text-red-600 hover:underline border border-red-100 bg-red-50 px-2 py-1.5 rounded text-center">View DL</a>
                </div>

                <div className="flex gap-2 mt-auto pt-2">
                  <a href={`tel:${b.customerPhone}`} className="flex-1 flex justify-center items-center py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg text-sm transition-colors">
                    <Phone className="mr-2" size={16} /> Call
                  </a>
                  {b.status === 'Pending' && (
                    <button onClick={() => approveBooking(b)} className="flex-1 flex justify-center items-center py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors">
                      <CheckCircle className="mr-2" size={16} /> Approve
                    </button>
                  )}
                  {b.status === 'Approved' && (
                    <button onClick={() => activateBooking(b)} className="flex-1 flex justify-center items-center py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg text-sm shadow-sm transition-colors">
                      <ArrowRight className="mr-2" size={16} /> Start Trip
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Active on Road Column */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold text-gray-900 border-b-2 border-green-600 pb-1">Vehicles on Road</h2>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-0.5 rounded-full">{active.length}</span>
          </div>
          
          <div className="space-y-4">
            {active.length === 0 && <p className="text-gray-500 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">No vehicles currently on the road.</p>}
            {active.map(b => (
              <div key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border border-green-200 border-l-4 border-l-green-500">
                <h3 className="font-bold text-lg mb-1">{b.vehicleName}</h3>
                <p className="text-sm text-gray-600 mb-4">Rented to {b.customerName} &bull; {b.customerPhone}</p>
                <div className="flex items-center justify-between mt-4">
                  <div className="text-xs text-gray-500">
                    Started: {format(new Date(b.startDate), 'PP p')}
                  </div>
                  <button onClick={() => markReturned(b)} className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg text-sm transition-colors">
                    <RotateCcw className="mr-2" size={16} /> Mark Returned
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        
      </div>
      
      {bookings.length === 0 && (
         <button onClick={seedData} className="mt-8 text-xs text-gray-400 hover:text-red-600 uncerline">seed demo data</button>
      )}
    </div>
  );
}
