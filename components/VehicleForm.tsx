'use client';

import { useState } from 'react';
import { Vehicle, PricingTier } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { uploadFile } from '@/lib/storage';
import { useRouter } from 'next/navigation';

interface VehicleFormProps {
  initialData?: Vehicle;
  isEdit?: boolean;
}

export function VehicleForm({ initialData, isEdit }: VehicleFormProps) {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<Omit<Vehicle, 'id'>>(initialData || {
    name: '',
    model: '',
    type: 'Car',
    year: new Date().getFullYear(),
    fuelType: 'Petrol',
    seatingCapacity: 4,
    description: '',
    images: [],
    status: 'Available',
    pricingTiers: [],
  });

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setUploading(true);
    try {
      const files = Array.from(e.target.files);
      const urls = await Promise.all(
        files.map(file => uploadFile(file, 'vehicles'))
      );
      setVehicle(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    } catch (err) {
      console.error(err);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setVehicle(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addTier = () => {
    setVehicle(prev => ({
      ...prev,
      pricingTiers: [
        ...prev.pricingTiers,
        { id: Date.now().toString(), hours: 12, price: 1000, kmLimit: 100 }
      ]
    }));
  };

  const updateTier = (id: string, field: keyof PricingTier, value: number) => {
    setVehicle(prev => ({
      ...prev,
      pricingTiers: prev.pricingTiers.map(t => 
        t.id === id ? { ...t, [field]: value } : t
      )
    }));
  };

  const removeTier = (id: string) => {
    setVehicle(prev => ({
      ...prev,
      pricingTiers: prev.pricingTiers.filter(t => t.id !== id)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit && initialData?.id) {
        await updateDoc(doc(db, 'vehicles', initialData.id), vehicle);
      } else {
        await addDoc(collection(db, 'vehicles'), vehicle);
      }
      router.push('/admin/vehicles');
    } catch (err) {
      console.error(err);
      alert('Error saving vehicle');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 text-gray-800">
      
      {/* Basic Info */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Vehicle Name</label>
            <input type="text" value={vehicle.name} onChange={e => setVehicle({...vehicle, name: e.target.value})} className="w-full border p-2 rounded" required placeholder="e.g. Swift Dzire" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Model</label>
            <input type="text" value={vehicle.model} onChange={e => setVehicle({...vehicle, model: e.target.value})} className="w-full border p-2 rounded" required placeholder="e.g. VXI" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select value={vehicle.type} onChange={e => setVehicle({...vehicle, type: e.target.value as 'Car' | 'Bike'})} className="w-full border p-2 rounded">
              <option value="Car">Car</option>
              <option value="Bike">Bike</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Year</label>
            <input type="number" value={vehicle.year} onChange={e => setVehicle({...vehicle, year: parseInt(e.target.value)})} className="w-full border p-2 rounded" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fuel Type</label>
            <input type="text" value={vehicle.fuelType} onChange={e => setVehicle({...vehicle, fuelType: e.target.value})} className="w-full border p-2 rounded" required placeholder="e.g. Petrol, Diesel, EV" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Seating Capacity</label>
            <input type="number" value={vehicle.seatingCapacity} onChange={e => setVehicle({...vehicle, seatingCapacity: parseInt(e.target.value)})} className="w-full border p-2 rounded" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea value={vehicle.description} onChange={e => setVehicle({...vehicle, description: e.target.value})} className="w-full border p-2 rounded" rows={3} required></textarea>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-xl font-bold mb-4">Images</h2>
        <div className="flex gap-4 flex-wrap mb-4">
          {vehicle.images.map((img, idx) => (
            <div key={idx} className="relative w-32 h-32 border rounded overflow-hidden">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">X</button>
            </div>
          ))}
          <label className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 text-gray-500">
            {uploading ? <span>Uploading...</span> : <span>+ Upload</span>}
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
          </label>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Dynamic Pricing Tiers</h2>
          <button type="button" onClick={addTier} className="text-blue-600 font-medium hover:underline">+ Add Tier</button>
        </div>
        <div className="space-y-4">
          {vehicle.pricingTiers.map(tier => (
            <div key={tier.id} className="flex gap-4 items-end bg-gray-50 p-4 rounded border border-gray-200">
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">Hours</label>
                <input type="number" value={tier.hours} onChange={e => updateTier(tier.id, 'hours', parseFloat(e.target.value))} className="w-full border p-2 rounded" required />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">Price (₹)</label>
                <input type="number" value={tier.price} onChange={e => updateTier(tier.id, 'price', parseFloat(e.target.value))} className="w-full border p-2 rounded" required />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">KM Limit</label>
                <input type="number" value={tier.kmLimit} onChange={e => updateTier(tier.id, 'kmLimit', parseFloat(e.target.value))} className="w-full border p-2 rounded" required />
              </div>
              <button type="button" onClick={() => removeTier(tier.id)} className="bg-red-50 text-red-600 p-2 rounded hover:bg-red-100 flex items-center justify-center">
                Delete
              </button>
            </div>
          ))}
          {vehicle.pricingTiers.length === 0 && (
             <p className="text-gray-500 text-sm">No pricing tiers added. Add at least one.</p>
          )}
        </div>
      </div>

      {/* Status Toggle */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex items-center gap-4">
        <label className="flex items-center cursor-pointer">
          <div className="relative">
            <input type="checkbox" className="sr-only" checked={vehicle.status !== 'Maintenance'} onChange={e => setVehicle({...vehicle, status: e.target.checked ? 'Available' : 'Maintenance'})} />
            <div className={`block w-14 h-8 rounded-full ${vehicle.status !== 'Maintenance' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition transform ${vehicle.status !== 'Maintenance' ? 'translate-x-6' : ''}`}></div>
          </div>
          <div className="ml-3 text-gray-700 font-medium">
            Vehicle Visible (Available / Maintenance)
          </div>
        </label>
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <button type="button" onClick={() => router.back()} className="px-6 py-2 border rounded-md mr-4 hover:bg-gray-50">Cancel</button>
        <button type="submit" disabled={saving || vehicle.pricingTiers.length === 0} className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Saving...' : (isEdit ? 'Update Vehicle' : 'Save Vehicle')}
        </button>
      </div>
    </form>
  )
}
