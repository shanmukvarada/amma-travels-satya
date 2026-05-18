'use client';

import { useState, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { Vehicle, PricingTier } from '@/lib/types';
import { X, Trash2, Plus, UploadCloud, Loader2 } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSaved: () => void;
  vehicleToEdit?: Vehicle | null;
}

export function VehicleFormModal({ onClose, onSaved, vehicleToEdit }: Props) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<Partial<Vehicle>>({
    name: vehicleToEdit?.name || '',
    model: vehicleToEdit?.model || '',
    type: vehicleToEdit?.type || 'Car',
    year: vehicleToEdit?.year || new Date().getFullYear(),
    fuelType: vehicleToEdit?.fuelType || 'Petrol',
    seatingCapacity: vehicleToEdit?.seatingCapacity || 4,
    description: vehicleToEdit?.description || '',
    status: vehicleToEdit?.status || 'Available',
    images: vehicleToEdit?.images || [],
    pricingTiers: vehicleToEdit?.pricingTiers || [],
    extraKmFee: vehicleToEdit?.extraKmFee || 0,
  });

  const [uploading, setUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleToggleStatus = () => {
    setFormData(prev => ({ ...prev, status: prev.status === 'Available' ? 'Maintenance' : 'Available' }));
  };

  const handleAddTier = () => {
    setFormData(prev => ({
      ...prev,
      pricingTiers: [...(prev.pricingTiers || []), { id: Date.now().toString(), hours: 0, price: 0, kmLimit: 0 }]
    }));
  };

  const handleRemoveTier = (id: string) => {
    setFormData(prev => ({
      ...prev,
      pricingTiers: (prev.pricingTiers || []).filter(t => t.id !== id)
    }));
  };

  const handleTierChange = (id: string, field: keyof PricingTier, value: number) => {
    setFormData(prev => ({
      ...prev,
      pricingTiers: (prev.pricingTiers || []).map(t => t.id === id ? { ...t, [field]: value } : t)
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);
    const newImages = [...(formData.images || [])];
    try {
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        const fileRef = ref(storage, `vehicles/${Date.now()}_${file.name}`);
        await uploadBytesResumable(fileRef, file);
        const url = await getDownloadURL(fileRef);
        newImages.push(url);
      }
      setFormData(prev => ({ ...prev, images: newImages }));
    } catch (e) {
      console.error(e);
      alert('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        year: Number(formData.year),
        seatingCapacity: Number(formData.seatingCapacity),
        extraKmFee: Number(formData.extraKmFee),
      };

      if (vehicleToEdit?.id) await updateDoc(doc(db, 'vehicles', vehicleToEdit.id), payload);
      else await addDoc(collection(db, 'vehicles'), payload);
      onSaved();
    } catch (err) {
      console.error(err);
      alert('Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-2xl font-display font-bold text-gray-900">{vehicleToEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div><label className="block text-sm font-medium mb-1">Name</label><input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-600" /></div>
            <div><label className="block text-sm font-medium mb-1">Model</label><input required type="text" name="model" value={formData.model} onChange={handleChange} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-600" /></div>
            <div><label className="block text-sm font-medium mb-1">Type</label><select name="type" value={formData.type} onChange={handleChange} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-600"><option>Car</option><option>Bike</option></select></div>
            <div><label className="block text-sm font-medium mb-1">Year</label><input required type="number" name="year" value={formData.year} onChange={handleChange} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-600" /></div>
            <div><label className="block text-sm font-medium mb-1">Fuel</label><input required type="text" name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-600" /></div>
            <div><label className="block text-sm font-medium mb-1">Seats</label><input required type="number" name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-600" /></div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea required name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-600" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-1">Extra Fee per KM (INR)</label>
            <input required type="number" name="extraKmFee" value={formData.extraKmFee} onChange={handleChange} className="w-full md:w-1/2 border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-red-600" />
          </div>

          <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900">Available for Rent</p>
              <p className="text-sm text-gray-500">Toggle to put vehicle in maintenance.</p>
            </div>
            <button type="button" onClick={handleToggleStatus} className={`w-12 h-6 rounded-full transition-colors relative ${formData.status === 'Available' ? 'bg-green-500' : 'bg-gray-300'}`}>
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${formData.status === 'Available' ? 'left-7' : 'left-1'}`} />
            </button>
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="block font-bold text-gray-900">Pricing Tiers</label>
              <button type="button" onClick={handleAddTier} className="text-sm bg-red-50 text-red-700 font-bold px-3 py-1.5 rounded flex items-center"><Plus size={16} className="mr-1"/> Add Tier</button>
            </div>
            <div className="space-y-2">
              {formData.pricingTiers?.map(t => (
                <div key={t.id} className="flex gap-2 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <input required type="number" placeholder="Hrs" value={t.hours} onChange={(e) => handleTierChange(t.id, 'hours', Number(e.target.value))} className="w-1/3 border rounded p-2 text-sm outline-none" />
                  <input required type="number" placeholder="₹" value={t.price} onChange={(e) => handleTierChange(t.id, 'price', Number(e.target.value))} className="w-1/3 border rounded p-2 text-sm outline-none" />
                  <input required type="number" placeholder="limit km" value={t.kmLimit} onChange={(e) => handleTierChange(t.id, 'kmLimit', Number(e.target.value))} className="w-1/3 border rounded p-2 text-sm outline-none" />
                  <button type="button" onClick={() => handleRemoveTier(t.id)} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label className="block font-bold text-gray-900 mb-2">Images</label>
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-red-200 bg-red-50/50 rounded-xl p-8 text-center cursor-pointer hover:bg-red-50 transition-colors">
              <UploadCloud className="mx-auto text-red-400 mb-2" size={32} />
              <p className="text-sm text-red-900 font-medium">Click to upload photos</p>
              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
            {uploading && <div className="text-sm text-red-600 mt-2 flex items-center justify-center"><Loader2 className="animate-spin mr-1" size={14}/> Uploading...</div>}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {formData.images?.map((url, idx) => (
                <div key={idx} className="relative group rounded border aspect-square overflow-hidden">
                  <img src={url} alt="veh" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => setFormData(prev => ({...prev, images: prev.images?.filter((_, i) => i !== idx)}))} className="absolute top-1 right-1 bg-white/90 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100"><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
          <button type="button" onClick={onClose} className="px-5 py-2.5 font-bold text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-100">Cancel</button>
          <button type="submit" disabled={loading || uploading} className="px-5 py-2.5 font-bold text-white bg-red-600 rounded-xl hover:bg-red-700 disabled:opacity-50">
            {loading ? 'Saving...' : 'Save Vehicle'}
          </button>
        </div>
      </div>
    </div>
  );
}
