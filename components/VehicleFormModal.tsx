'use client';

import { useState, useRef } from 'react';
import { db, storage } from '@/lib/firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { Vehicle, PricingTier } from '@/lib/types';
import { X, Trash2, Plus, UploadCloud } from 'lucide-react';

interface VehicleFormModalProps {
  onClose: () => void;
  onSaved: () => void;
  vehicleToEdit?: Vehicle | null;
}

export function VehicleFormModal({ onClose, onSaved, vehicleToEdit }: VehicleFormModalProps) {
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
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleToggleStatus = () => {
    setFormData(prev => ({
      ...prev,
      status: prev.status === 'Available' ? 'Maintenance' : 'Available'
    }));
  };

  const handleAddTier = () => {
    setFormData(prev => ({
      ...prev,
      pricingTiers: [
        ...(prev.pricingTiers || []),
        { id: Date.now().toString(), hours: 0, price: 0, kmLimit: 0 }
      ]
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
      pricingTiers: (prev.pricingTiers || []).map(t => 
        t.id === id ? { ...t, [field]: value } : t
      )
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploading(true);
    const newImages = [...(formData.images || [])];
    
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      const fileRef = ref(storage, `vehicles/${Date.now()}_${file.name}`);
      const uploadTask = await uploadBytesResumable(fileRef, file);
      const url = await getDownloadURL(fileRef);
      newImages.push(url);
    }
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setUploading(false);
  };

  const handleRemoveImage = (index: number) => {
    const newImages = [...(formData.images || [])];
    newImages.splice(index, 1);
    setFormData(prev => ({ ...prev, images: newImages }));
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

      if (vehicleToEdit?.id) {
        await updateDoc(doc(db, 'vehicles', vehicleToEdit.id), payload);
      } else {
        await addDoc(collection(db, 'vehicles'), payload);
      }
      onSaved();
    } catch (err) {
      console.error(err);
      alert('Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  // Dropzone handling
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    setUploading(true);
    const newImages = [...(formData.images || [])];
    
    for (let i = 0; i < e.dataTransfer.files.length; i++) {
      const file = e.dataTransfer.files[i];
      const fileRef = ref(storage, `vehicles/${Date.now()}_${file.name}`);
      const uploadTask = await uploadBytesResumable(fileRef, file);
      const url = await getDownloadURL(fileRef);
      newImages.push(url);
    }
    
    setFormData(prev => ({ ...prev, images: newImages }));
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 mt-0 overflow-y-auto pt-20 pb-10">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-fit overflow-hidden my-auto relative">
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold">{vehicleToEdit ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[75vh]">
          {/* Status Toggle */}
          <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
            <div>
              <p className="font-bold text-gray-900">Vehicle Status</p>
              <p className="text-sm text-gray-500">Toggle whether this vehicle is available for rent or under maintenance.</p>
            </div>
            <button
              type="button"
              onClick={handleToggleStatus}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.status === 'Available' ? 'bg-indigo-600' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                formData.status === 'Available' ? 'translate-x-6' : 'translate-x-1'
              }`} />
            </button>
            <span className="ml-3 text-sm font-medium text-gray-900">{formData.status}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" placeholder="e.g. Swift Dzire" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model / CC</label>
              <input required type="text" name="model" value={formData.model} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" placeholder="e.g. VXI or 350cc" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select name="type" value={formData.type} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2">
                <option value="Car">Car</option>
                <option value="Bike">Bike</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input required type="number" name="year" value={formData.year} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type</label>
              <input required type="text" name="fuelType" value={formData.fuelType} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" placeholder="e.g. Petrol, Diesel, EV" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seating Capacity</label>
              <input required type="number" name="seatingCapacity" value={formData.seatingCapacity} onChange={handleChange} className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea required name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full border border-gray-300 rounded-md p-2" />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Global Over-Limit Input (Extra Fee per KM in INR)</label>
            <input required type="number" name="extraKmFee" value={formData.extraKmFee} onChange={handleChange} className="w-1/2 border border-gray-300 rounded-md p-2" />
          </div>

          {/* Pricing Tiers */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">Pricing Tiers</label>
              <button type="button" onClick={handleAddTier} className="text-sm bg-indigo-50 text-indigo-700 px-3 py-1 rounded-md flex items-center gap-1 hover:bg-indigo-100 font-medium">
                <Plus size={16} /> Add Tier
              </button>
            </div>
            {(!formData.pricingTiers || formData.pricingTiers.length === 0) ? (
              <div className="text-sm text-gray-500 py-4 text-center border border-dashed border-gray-300 rounded-lg">No tiers added. Add at least one pricing tier.</div>
            ) : (
              <div className="space-y-3">
                {formData.pricingTiers.map(tier => (
                  <div key={tier.id} className="flex gap-4 items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <div className="w-1/3">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Hours Limit</label>
                      <input required type="number" value={tier.hours} onChange={(e) => handleTierChange(tier.id, 'hours', Number(e.target.value))} className="w-full border border-gray-300 rounded bg-white p-1.5 text-sm" />
                    </div>
                    <div className="w-1/3">
                      <label className="block text-xs font-medium text-gray-500 mb-1">Price (INR)</label>
                      <input required type="number" value={tier.price} onChange={(e) => handleTierChange(tier.id, 'price', Number(e.target.value))} className="w-full border border-gray-300 rounded bg-white p-1.5 text-sm" />
                    </div>
                    <div className="w-1/3">
                      <label className="block text-xs font-medium text-gray-500 mb-1">KM Limit</label>
                      <input required type="number" value={tier.kmLimit} onChange={(e) => handleTierChange(tier.id, 'kmLimit', Number(e.target.value))} className="w-full border border-gray-300 rounded bg-white p-1.5 text-sm" />
                    </div>
                    <button type="button" onClick={() => handleRemoveTier(tier.id)} className="text-red-500 hover:text-red-700 mt-5 p-1 bg-red-50 rounded">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Images */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Multi-Image Upload</label>
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:bg-gray-50 hover:border-indigo-400 transition-colors"
            >
              <UploadCloud className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-sm text-gray-600">Drag & drop images here, or click to select files</p>
              <p className="text-xs text-gray-400 mt-1">Supports multiple image upload</p>
              <input ref={fileInputRef} type="file" multiple accept="image/*" onChange={handleFileUpload} className="hidden" />
            </div>
            
            {uploading && <div className="text-sm text-indigo-600 mt-2 font-medium">Uploading images...</div>}

            {formData.images && formData.images.length > 0 && (
              <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-4 mt-4">
                {formData.images.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-square">
                    <img src={url} alt="Vehicle Upload" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 bg-white bg-opacity-75 hover:bg-opacity-100 text-red-600 rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-8">
            <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || uploading} className="px-5 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
