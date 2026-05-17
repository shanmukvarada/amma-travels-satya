'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, updateDoc, getDoc, setDoc, addDoc } from 'firebase/firestore';
import { Booking, Vehicle, BusinessConfig } from '@/lib/types';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const [activeBookings, setActiveBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<BusinessConfig | null>(null);

  // Return Modal State
  const [returnBooking, setReturnBooking] = useState<Booking | null>(null);
  const [endingKm, setEndingKm] = useState<number | ''>('');
  const [processingReturn, setProcessingReturn] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    // Config
    const confSnap = await getDoc(doc(db, 'config', 'global'));
    if (confSnap.exists()) setConfig(confSnap.data() as BusinessConfig);

    // Active Bookings
    const q = query(collection(db, 'bookings'), where('status', 'in', ['Active', 'Pending']));
    const snap = await getDocs(q);
    const data: Booking[] = [];
    snap.forEach(d => data.push({ id: d.id, ...d.data() } as Booking));
    setActiveBookings(data);
    setLoading(false);
  }

  const seedInitialData = async () => {
    try {
      setLoading(true);
      // Create Config
      await setDoc(doc(db, 'config', 'global'), {
        companyName: 'Amma Travels',
        phone: '9652520222',
        address: 'Kakinada',
        alertBanner: 'Welcome to Amma Travels - Book top quality cars and bikes!',
        extraFeePerKm: 12,
      });

      // Check if vehicles already exist to avoid duplicates
      const vSnap = await getDocs(collection(db, 'vehicles'));
      if (vSnap.empty) {
        // Car
        await addDoc(collection(db, 'vehicles'), {
          name: 'Swift Dzire',
          model: 'VXI',
          type: 'Car',
          year: 2022,
          fuelType: 'Petrol',
          seatingCapacity: 4,
          description: 'A comfortable and reliable sedan perfect for city tours and outstation trips.',
          images: ['https://picsum.photos/seed/dzire/800/600'],
          status: 'Available',
          pricingTiers: [
            { id: '1', hours: 12, price: 1500, kmLimit: 150 },
            { id: '2', hours: 24, price: 2500, kmLimit: 300 },
          ]
        });

        // Bike
        await addDoc(collection(db, 'vehicles'), {
          name: 'Royal Enfield Classic',
          model: '350cc',
          type: 'Bike',
          year: 2021,
          fuelType: 'Petrol',
          seatingCapacity: 2,
          description: 'Classic cruiser bike for adventurous rides. Enjoy the thumper.',
          images: ['https://picsum.photos/seed/enfield/800/600'],
          status: 'Available',
          pricingTiers: [
            { id: '1', hours: 12, price: 800, kmLimit: 100 },
            { id: '2', hours: 24, price: 1400, kmLimit: 250 },
          ]
        });
      }

      await loadData();
      alert("Database populated successfully!");
    } catch (e) {
      console.error(e);
      alert("Error seeding data");
    } finally {
      setLoading(false);
    }
  };

  const approveBooking = async (b: Booking) => {
    if (!b.id) return;
    await updateDoc(doc(db, 'bookings', b.id), { status: 'Active' });
    await updateDoc(doc(db, 'vehicles', b.vehicleId), { status: 'Booked' });
    loadData();
  };

  const handleProcessReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnBooking || !returnBooking.id || !config) return;
    
    setProcessingReturn(true);
    const kmLimit = returnBooking.selectedTier.kmLimit;
    const finalKm = Number(endingKm);
    
    // We assume the user has driven 'finalKm' total since getting the car.
    // If we wanted to track starting KM strictly, we'd need it in the booking.
    // Let's assume endingKm is the total KM driven during the trip for simplicity.
    const drivenKm = finalKm; 
    let extraKmFee = 0;

    if (drivenKm > kmLimit) {
      const extraKm = drivenKm - kmLimit;
      extraKmFee = extraKm * config.extraFeePerKm;
    }

    try {
      await updateDoc(doc(db, 'bookings', returnBooking.id), {
        status: 'Completed',
        returnKm: drivenKm,
        extraKmFee
      });
      await updateDoc(doc(db, 'vehicles', returnBooking.vehicleId), {
        status: 'Available'
      });
      setReturnBooking(null);
      setEndingKm('');
      loadData();
      alert(`Return processed successfully!\\nTotal Extra Fee: ₹${extraKmFee}`);
    } catch (err) {
      console.error(err);
      alert('Failed to process return');
    } finally {
      setProcessingReturn(false);
    }
  };


  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Live Operations Tracker</h1>
        <button 
          onClick={seedInitialData} 
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 font-medium"
        >
          Seed Initial Data
        </button>
      </div>
      
      <div className="bg-white border text-gray-800 border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vehicle</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activeBookings.map(b => (
              <tr key={b.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900">{b.customerName}</div>
                  <div className="text-sm text-gray-500">{b.phone}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{b.selectedTier.hours}h Package</div>
                  <div className="text-sm font-medium text-gray-900">₹{b.totalBasePrice}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-500">Pick: {format(new Date(b.startTime), 'dd MMM, p')}</div>
                  <div className="text-xs text-gray-500">Drop: {format(new Date(b.endTime), 'dd MMM, p')}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    b.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {b.status === 'Pending' && (
                    <button onClick={() => approveBooking(b)} className="text-blue-600 hover:text-blue-900 mr-4">Approve</button>
                  )}
                  {b.status === 'Active' && (
                    <button onClick={() => setReturnBooking(b)} className="text-indigo-600 hover:text-indigo-900 mr-4">Process Return</button>
                  )}
                  <a href={b.aadhaarUrl} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-700 mr-2 text-xs">Aadhaar</a>
                  <a href={b.dlUrl} target="_blank" rel="noreferrer" className="text-gray-500 hover:text-gray-700 text-xs">DL</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {activeBookings.length === 0 && (
          <div className="p-8 text-center text-gray-500">No active or pending bookings.</div>
        )}
      </div>

      {/* Process Return Modal */}
      {returnBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full m-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Process Vehicle Return</h2>
            <p className="text-sm text-gray-500 mb-4">
              Customer: {returnBooking.customerName}<br/>
              Tier KM Limit: {returnBooking.selectedTier.kmLimit} km
            </p>
            <form onSubmit={handleProcessReturn}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Kilometers Driven</label>
                <input 
                  type="number" 
                  value={endingKm}
                  onChange={e => setEndingKm(e.target.value as unknown as number)}
                  className="w-full border p-2 rounded text-gray-900" 
                  required
                  min={0}
                />
              </div>
              
              {endingKm !== '' && Number(endingKm) > returnBooking.selectedTier.kmLimit && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded text-sm">
                  <b>Over Limit!</b><br/>
                  Extra KM: {Number(endingKm) - returnBooking.selectedTier.kmLimit} km<br/>
                  Extra Fee: ₹{(Number(endingKm) - returnBooking.selectedTier.kmLimit) * (config?.extraFeePerKm || 0)}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReturnBooking(null)} className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={processingReturn} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
                  {processingReturn ? 'Processing...' : 'Complete Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
