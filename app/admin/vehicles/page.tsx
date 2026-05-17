'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { Vehicle } from '@/lib/db';
import { useUIStore } from '@/store/uiStore';
import { Plus, Trash, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

export default function AdminVehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const { setToast } = useUIStore();
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    const q = query(collection(db, 'vehicles'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setVehicles(snap.docs.map(d => ({ id: d.id, ...d.data() } as Vehicle)));
    });
    return () => unsub();
  }, []);

  const handleDelete = async (id: string) => {
    if(!confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await deleteDoc(doc(db, 'vehicles', id));
      setToast('Vehicle deleted', 'success');
    } catch (e: any) {
      setToast(e.message, 'error');
    }
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-heading font-bold text-gray-900">Manage Vehicles</h1>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="flex items-center px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" /> Add Vehicle
        </button>
      </div>

      {isAdding && (
         <AddVehicleForm onSuccess={() => setIsAdding(false)} onCancel={() => setIsAdding(false)} />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {vehicles.map(v => (
          <div key={v.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="aspect-video bg-gray-100 relative">
               <Image src={v.images[0] || `https://picsum.photos/seed/${v.id}/400/300`} fill className="object-cover" alt="" referrerPolicy="no-referrer" />
               <div className="absolute top-2 right-2 flex space-x-1">
                 <button onClick={() => handleDelete(v.id)} className="p-2 bg-white/90 text-red-500 rounded-lg hover:bg-white backdrop-blur-sm shadow-sm"><Trash className="w-4 h-4"/></button>
               </div>
             </div>
             <div className="p-4">
               <div className="flex justify-between items-start mb-2">
                 <h3 className="font-bold text-lg text-gray-900">{v.brand} {v.model}</h3>
                 <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${v.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                   {v.isAvailable ? 'Available' : 'Unavailable'}
                 </span>
               </div>
               <p className="text-sm text-gray-500 mb-2">{v.type.toUpperCase()} • {v.transmission} • {v.fuelType}</p>
               <div className="font-bold text-accent">₹{v.pricePerDay}/day</div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddVehicleForm({ onSuccess, onCancel }: { onSuccess: ()=>void, onCancel: ()=>void }) {
  const { setToast } = useUIStore();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    try {
      let imageUrl = '';
      if (imageFile) {
        const storageRef = ref(storage, `vehicles/${Date.now()}_${imageFile.name}`);
        const snap = await uploadBytesResumable(storageRef, imageFile);
        imageUrl = await getDownloadURL(snap.ref);
      }

      const newRef = doc(collection(db, 'vehicles'));
      await setDoc(newRef, {
        name: fd.get('name'),
        brand: fd.get('brand'),
        model: fd.get('model'),
        type: fd.get('type'),
        fuelType: fd.get('fuelType'),
        seatingCapacity: Number(fd.get('seatingCapacity')),
        transmission: fd.get('transmission'),
        registrationNumber: fd.get('registrationNumber'),
        pricePerDay: Number(fd.get('pricePerDay')),
        securityDeposit: Number(fd.get('securityDeposit')),
        description: fd.get('description'),
        features: (fd.get('features') as string).split(',').map(s=>s.trim()),
        images: imageUrl ? [imageUrl] : [],
        isAvailable: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setToast('Vehicle Added', 'success');
      onSuccess();
    } catch(err: any) {
      setToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-8 space-y-4">
      <h3 className="font-bold text-xl mb-4">Add New Vehicle</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input name="name" required placeholder="Display Name (e.g. Swift Dzire)" className="border rounded-lg px-3 py-2" />
        <input name="brand" required placeholder="Brand (e.g. Maruti)" className="border rounded-lg px-3 py-2" />
        <input name="model" required placeholder="Model (e.g. Dzire)" className="border rounded-lg px-3 py-2" />
        
        <select name="type" required className="border rounded-lg px-3 py-2">
          <option value="car">Car</option><option value="bike">Bike</option>
        </select>
        
        <select name="fuelType" required className="border rounded-lg px-3 py-2">
          <option value="Petrol">Petrol</option><option value="Diesel">Diesel</option><option value="EV">EV</option>
        </select>
        
        <select name="transmission" required className="border rounded-lg px-3 py-2">
          <option value="Manual">Manual</option><option value="Automatic">Automatic</option>
        </select>
        
        <input name="seatingCapacity" type="number" required placeholder="Seats (e.g. 5)" className="border rounded-lg px-3 py-2" />
        <input name="registrationNumber" required placeholder="Reg Number (e.g. AP 05 XX 1234)" className="border rounded-lg px-3 py-2" />
        <input name="pricePerDay" type="number" required placeholder="Price/Day (₹)" className="border rounded-lg px-3 py-2" />
        <input name="securityDeposit" type="number" required placeholder="Deposit (₹)" className="border rounded-lg px-3 py-2" />
        <input name="features" required placeholder="Features (comma separated)" className="border rounded-lg px-3 py-2 md:col-span-2" />
      </div>
      
      <textarea name="description" required placeholder="Description..." className="w-full border rounded-lg px-3 py-2 mt-4" rows={2}></textarea>
      
      <div className="pt-2">
        <label className="flex items-center space-x-2 cursor-pointer text-accent hover:text-accent-hover w-max">
           <ImageIcon className="w-5 h-5"/> <span>Choose Featured Image</span>
           <input type="file" required accept="image/*" className="hidden" onChange={e => setImageFile(e.target.files?.[0] || null)} />
        </label>
        {imageFile && <span className="text-xs text-gray-500 block mt-1">{imageFile.name}</span>}
      </div>

      <div className="flex space-x-3 pt-4">
        <button type="submit" disabled={loading} className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover">
          {loading ? 'Saving...' : 'Save Vehicle'}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
      </div>
    </form>
  )
}
