'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc, collection, addDoc } from 'firebase/firestore';
import { Vehicle, PricingTier } from '@/lib/types';
import { uploadFile } from '@/lib/storage';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function VehicleBookingPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [selectedTier, setSelectedTier] = useState<PricingTier | null>(null);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: ''
  });
  const [files, setFiles] = useState<{ aadhaar: File | null, dl: File | null }>({ aadhaar: null, dl: null });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      if (!id) return;
      const vSnap = await getDoc(doc(db, 'vehicles', id as string));
      if (vSnap.exists()) {
        const data = { id: vSnap.id, ...vSnap.data() } as Vehicle;
        setVehicle(data);
        if (data.pricingTiers && data.pricingTiers.length > 0) {
          setSelectedTier(data.pricingTiers[0]); // Default to first tier
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle || !selectedTier) return;
    if (!files.aadhaar || !files.dl) {
      alert("Please upload both Aadhaar and Driving License");
      return;
    }
    
    setSubmitting(true);
    try {
      // Upload Docs
      const aadhaarUrl = await uploadFile(files.aadhaar, `documents/${formData.phone}`);
      const dlUrl = await uploadFile(files.dl, `documents/${formData.phone}`);

      // Create Booking
      await addDoc(collection(db, 'bookings'), {
        customerName: formData.customerName,
        phone: formData.phone,
        address: formData.address,
        aadhaarUrl,
        dlUrl,
        vehicleId: vehicle.id,
        selectedTier,
        totalBasePrice: selectedTier.price,
        status: 'Pending',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + selectedTier.hours * 3600000).toISOString()
      });

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Failed to submit booking.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;
  if (!vehicle) return <div className="p-8 text-center">Vehicle not found.</div>;

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Pending Approval</h2>
          <p className="text-gray-600 mb-8">
            Your booking request for the <span className="font-semibold">{vehicle.name}</span> has been sent! Please wait for the owner to confirm.
          </p>
          <Link href="/" className="bg-indigo-600 text-white w-full py-3 rounded-lg font-bold block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 bg-gray-50 min-h-screen">
      <header className="bg-white px-4 py-4 flex items-center sticky top-0 z-10 shadow-sm">
        <button onClick={() => router.back()} className="mr-4 p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>
        <h1 className="text-lg font-bold truncate">{vehicle.name}</h1>
      </header>

      {/* Swipeable Carousel */}
      <div className="w-full overflow-x-auto flex snap-x snap-mandatory hide-scrollbar bg-gray-900 h-64 md:h-96">
        {vehicle.images.length > 0 ? (
          vehicle.images.map((img, i) => (
            <img key={i} src={img} alt={`${vehicle.name} ${i+1}`} className="h-full object-cover snap-center min-w-full" />
          ))
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">No Image</div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900">{vehicle.name}</h2>
              <p className="text-gray-500">{vehicle.model} • {vehicle.year}</p>
            </div>
            <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-bold">{vehicle.type}</span>
          </div>
          
          <div className="flex gap-4 mb-4 pb-4 border-b border-gray-100">
            <div className="text-center flex-1">
              <span className="block text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Fuel</span>
              <span className="font-semibold">{vehicle.fuelType}</span>
            </div>
            <div className="text-center flex-1 border-l border-gray-100">
              <span className="block text-gray-400 text-xs uppercase font-bold tracking-wider mb-1">Seats</span>
              <span className="font-semibold">{vehicle.seatingCapacity}</span>
            </div>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed">{vehicle.description}</p>
        </div>

        {vehicle.status === 'Booked' ? (
          <div className="bg-red-50 text-red-700 p-6 rounded-2xl text-center shadow-sm border border-red-100 border-opacity-50">
            <h3 className="text-xl font-bold mb-2">Currently Booked</h3>
            <p>This vehicle is not available for new bookings right now.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold mb-6">Book this Vehicle</h3>
            
            {/* Package Selector */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-2">Select Rental Package</label>
              <select 
                className="w-full border-gray-300 border rounded-xl p-4 bg-gray-50 font-medium text-gray-900 focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 outline-none"
                value={selectedTier?.id || ''}
                onChange={e => setSelectedTier(vehicle.pricingTiers.find(t => t.id === e.target.value) || null)}
                required
              >
                {vehicle.pricingTiers.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.hours} Hours - ₹{t.price} ({t.kmLimit}km Limit)
                  </option>
                ))}
              </select>
              {selectedTier && (
                <p className="text-xs text-gray-500 mt-2">
                  * Note: Driving over {selectedTier.kmLimit}km will incur extra fees upon return.
                </p>
              )}
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input type="text" required value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3" placeholder="9652520222" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Address</label>
                <textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full border border-gray-300 rounded-lg p-3" rows={2}></textarea>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <h4 className="text-sm font-bold text-gray-900">Upload Documents</h4>
              
              <div className="p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Card <span className="text-red-500">*</span></label>
                <input type="file" accept="image/*" required onChange={e => setFiles({...files, aadhaar: e.target.files?.[0] || null})} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>

              <div className="p-4 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">Driving License <span className="text-red-500">*</span></label>
                <input type="file" accept="image/*" required onChange={e => setFiles({...files, dl: e.target.files?.[0] || null})} className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
              </div>
            </div>

            {/* Price Summary & Submit */}
            <div className="border-t border-gray-100 pt-6">
              <div className="flex justify-between items-end mb-6">
                <span className="text-gray-500">Total Base Price</span>
                <span className="text-3xl font-black text-indigo-600">₹{selectedTier?.price || 0}</span>
              </div>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full bg-gray-900 text-white rounded-xl py-4 font-bold shadow-lg hover:bg-gray-800 disabled:opacity-50 transition-opacity"
              >
                {submitting ? 'Submitting Request...' : 'Send Request to Book'}
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
}
