'use client';

import { useState, useEffect, use } from 'react';
import { db, storage } from '@/lib/firebase';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, uploadBytes } from 'firebase/storage';
import { Vehicle, PricingTier, Booking } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, UploadCloud, Info } from 'lucide-react';
import Link from 'next/link';
import imageCompression from 'browser-image-compression';

export default function VehicleDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedTierId, setSelectedTierId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [address, setAddress] = useState('');
  
  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [dlFile, setDlFile] = useState<File | null>(null);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successWhatsappUrl, setSuccessWhatsappUrl] = useState('');

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const docRef = doc(db, 'vehicles', resolvedParams.id);
        const snapshot = await getDoc(docRef);
        if (snapshot.exists()) {
          setVehicle({ id: snapshot.id, ...snapshot.data() } as Vehicle);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicle();
  }, [resolvedParams.id]);

  const selectedTier = vehicle?.pricingTiers?.find(t => t.id === selectedTierId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vehicle || !selectedTier || !aadharFile || !dlFile) {
      setError("Please fill all fields and upload required documents.");
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const compressOpts = { maxSizeMB: 0.5, maxWidthOrHeight: 1200, useWebWorker: false };
      
      const [compressedAadhar, compressedDl] = await Promise.all([
        imageCompression(aadharFile, compressOpts),
        imageCompression(dlFile, compressOpts)
      ]);

      const aadharRef = ref(storage, `bookings/${Date.now()}_aadhar_${compressedAadhar.name}`);
      const dlRef = ref(storage, `bookings/${Date.now()}_dl_${compressedDl.name}`);

      const [aadharUrl, dlUrl] = await Promise.all([
        uploadBytes(aadharRef, compressedAadhar).then(s => getDownloadURL(s.ref)),
        uploadBytes(dlRef, compressedDl).then(s => getDownloadURL(s.ref))
      ]) as [string, string];

      const bookingData: Partial<Booking> = {
        vehicleId: vehicle.id,
        vehicleName: `${vehicle.name} (${vehicle.year})`,
        customerName,
        customerPhone,
        address,
        aadharUrl,
        dlUrl,
        status: 'Pending',
        startDate: new Date().toISOString(),
        selectedTier,
        totalPrice: selectedTier.price,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'bookings'), bookingData);
      
      // Store ID in local storage so status page can track it
      const existing = JSON.parse(localStorage.getItem('my_bookings') || '[]');
      localStorage.setItem('my_bookings', JSON.stringify([...existing, docRef.id]));

      const message = `Hello Amma Travels! I want to book a vehicle.

*Vehicle:* ${vehicle.name} (${vehicle.year})
*Package:* ${selectedTier.hours} Hours (${selectedTier.kmLimit} km limit)
*Price:* ₹${selectedTier.price}

*My Details:*
*Name:* ${customerName}
*Phone:* ${customerPhone}
*Address:* ${address}

Documents uploaded and booking submitted via app.`;
      
      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/917780763121?text=${encodedMessage}`;
      setSuccessWhatsappUrl(whatsappUrl);
    } catch (err) {
      console.error(err);
      setError("Failed to create booking. Try again later.");
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" size={32} /></div>;
  if (!vehicle) return <div className="text-center py-20 text-gray-500">Vehicle not found.</div>;

  if (successWhatsappUrl) {
    return (
      <div className="max-w-md mx-auto pt-10 pb-8 text-center">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          </div>
          <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Request Submitted</h2>
          <p className="text-gray-600 mb-6">Your details and documents have been securely uploaded.</p>
          <a
            href={successWhatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full inline-block bg-green-500 hover:bg-green-600 text-white font-bold text-lg py-4 px-6 rounded-xl shadow-lg transition-colors"
          >
            Send Details to WhatsApp
          </a>
          <button
            onClick={() => router.push('/')}
            className="w-full mt-4 font-bold text-gray-600 py-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-red-600 mb-6">
        <ArrowLeft size={16} className="mr-1" /> Back to Home
      </Link>
      
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 mb-8">
        <div className="h-64 sm:h-80 bg-gray-100 overflow-x-auto flex snap-x snap-mandatory">
          {vehicle.images && vehicle.images.map((img, i) => (
            <img key={i} src={img} alt={`${vehicle.name} ${i+1}`} className="h-full w-full object-cover shrink-0 snap-center" />
          ))}
          {(!vehicle.images || vehicle.images.length === 0) && (
            <div className="w-full h-full flex items-center justify-center text-gray-400">No Image Available</div>
          )}
        </div>
        <div className="p-6">
          <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">{vehicle.name}</h1>
          <p className="text-gray-600 mb-4">{vehicle.description}</p>
          <div className="flex flex-wrap gap-3 text-sm text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="bg-white px-3 py-1 rounded shadow-sm border border-gray-100"><span className="font-medium text-gray-500 mr-2">Type</span>{vehicle.type}</div>
            <div className="bg-white px-3 py-1 rounded shadow-sm border border-gray-100"><span className="font-medium text-gray-500 mr-2">Fuel</span>{vehicle.fuelType}</div>
            <div className="bg-white px-3 py-1 rounded shadow-sm border border-gray-100"><span className="font-medium text-gray-500 mr-2">Seats</span>{vehicle.seatingCapacity}</div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-200">
        <h2 className="font-display text-2xl font-bold mb-6 text-gray-900">Request Booking</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Rental Duration & Pricing</label>
            <select 
              required
              value={selectedTierId} 
              onChange={(e) => setSelectedTierId(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 bg-white shadow-sm focus:ring-2 focus:ring-red-600 focus:border-red-600 outline-none"
            >
              <option value="">-- Choose a package --</option>
              {vehicle.pricingTiers?.map(t => (
                <option key={t.id} value={t.id}>
                  {t.hours} Hours - ₹{t.price} ({t.kmLimit} km Limit)
                </option>
              ))}
            </select>
            {selectedTier && (
              <div className="mt-3 bg-red-50 text-red-800 p-3 rounded-lg flex items-start gap-2 text-sm border border-red-100">
                <Info size={18} className="shrink-0 mt-0.5 text-red-600" />
                <div>
                  <p className="font-bold">Total: ₹{selectedTier.price}</p>
                  <p>Includes {selectedTier.kmLimit} km. Extra usage is charged at ₹{vehicle.extraKmFee}/km.</p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-bold text-gray-900 mb-4">Your Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-red-600 outline-none" placeholder="Enter your full name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input required type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full border border-gray-300 rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-red-600 outline-none" placeholder="Mobile Number" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Local Address</label>
                <textarea required value={address} onChange={e => setAddress(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-xl p-3 shadow-sm focus:ring-2 focus:ring-red-600 outline-none" placeholder="Your current address or hotel" />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6">
            <h3 className="font-bold text-gray-900 mb-4">Verification Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="border border-gray-300 rounded-xl p-4 bg-gray-50 relative group hover:border-red-400 transition-colors">
                <label className="block text-sm font-bold text-gray-700 mb-2">Aadhaar Card</label>
                <input required type="file" accept="image/*" capture="environment" onChange={e => setAadharFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="text-center">
                  <UploadCloud className={`mx-auto mb-2 ${aadharFile ? 'text-green-500' : 'text-gray-400'}`} size={24} />
                  <span className="text-sm font-medium text-red-600">{aadharFile ? aadharFile.name : 'Tap to Upload or Take Photo'}</span>
                </div>
              </div>

              <div className="border border-gray-300 rounded-xl p-4 bg-gray-50 relative group hover:border-red-400 transition-colors">
                <label className="block text-sm font-bold text-gray-700 mb-2">Driving License</label>
                <input required type="file" accept="image/*" capture="environment" onChange={e => setDlFile(e.target.files?.[0] || null)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="text-center">
                  <UploadCloud className={`mx-auto mb-2 ${dlFile ? 'text-green-500' : 'text-gray-400'}`} size={24} />
                  <span className="text-sm font-medium text-red-600">{dlFile ? dlFile.name : 'Tap to Upload or Take Photo'}</span>
                </div>
              </div>

            </div>
          </div>

          {error && <div className="text-red-600 text-sm font-medium p-3 bg-red-50 rounded-lg">{error}</div>}

          <button 
            type="submit" 
            disabled={submitting}
            className="w-full bg-red-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg hover:shadow-xl hover:bg-red-700 transition-all disabled:opacity-70 flex justify-center items-center"
          >
            {submitting ? <><Loader2 className="animate-spin mr-2" /> Processing...</> : 'Submit Request'}
          </button>
          
        </form>
      </div>
    </div>
  );
}
