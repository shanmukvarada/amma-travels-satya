'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Vehicle } from '@/lib/types';
import { VehicleFormModal } from '@/components/VehicleFormModal';
import { Loader2, Edit, Power, Trash2, ShieldAlert } from 'lucide-react';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const snap = await getDocs(collection(db, 'vehicles'));
      setVehicles(snap.docs.map(d => ({ id: d.id, ...d.data() } as Vehicle)));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadVehicles(); }, []);

  const toggleStatus = async (v: Vehicle) => {
    if (!v.id) return;
    const newStatus = v.status === 'Available' ? 'Maintenance' : 'Available';
    await updateDoc(doc(db, 'vehicles', v.id), { status: newStatus });
    loadVehicles();
  };

  const deleteVehicle = async (v: Vehicle) => {
    if (!v.id) return;
    if (confirm(`Are you sure you want to delete ${v.name}?`)) {
      await deleteDoc(doc(db, 'vehicles', v.id));
      loadVehicles();
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" size={32} /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900">Inventory Manager</h1>
        <button 
          onClick={() => { setEditingVehicle(null); setShowModal(true); }}
          className="bg-red-600 text-white px-5 py-2.5 rounded-lg font-bold hover:bg-red-700 shadow-sm transition-colors"
        >
          + Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map(v => (
          <div key={v.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col group relative">
            <div className="h-48 bg-gray-100 relative">
              {v.images?.[0] ? (
                <img src={v.images[0]} className="w-full h-full object-cover" alt={v.name}/>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
              )}
              <div className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded-lg ${v.status === 'Available' ? 'bg-green-100 text-green-800' : v.status === 'Booked' ? 'bg-red-100 text-red-800' : 'bg-red-100 text-red-800'}`}>
                {v.status}
              </div>
            </div>
            
            <div className="p-5 flex-1 flex flex-col">
              <h2 className="font-bold text-xl mb-1 text-gray-900">{v.name}</h2>
              <p className="text-sm text-gray-500 mb-4">{v.model} &bull; {v.year}</p>
              
              <div className="mt-auto grid grid-cols-3 gap-2 border-t border-gray-100 pt-4">
                <button onClick={() => { setEditingVehicle(v); setShowModal(true); }} className="flex flex-col items-center justify-center py-2 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg text-xs font-medium transition-colors">
                  <Edit size={16} className="mb-1" /> Edit
                </button>
                <button onClick={() => toggleStatus(v)} disabled={v.status === 'Booked'} className={`flex flex-col items-center justify-center py-2 bg-gray-50 hover:bg-amber-50 text-gray-600 hover:text-amber-600 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:hover:bg-gray-50 disabled:hover:text-gray-600`}>
                  <ShieldAlert size={16} className="mb-1" /> Toggle
                </button>
                <button onClick={() => deleteVehicle(v)} className="flex flex-col items-center justify-center py-2 bg-gray-50 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg text-xs font-medium transition-colors">
                  <Trash2 size={16} className="mb-1" /> Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {vehicles.length === 0 && (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-200 shadow-sm text-gray-500">
          No vehicles in inventory.
        </div>
      )}

      {showModal && (
        <VehicleFormModal 
          vehicleToEdit={editingVehicle}
          onClose={() => { setShowModal(false); setEditingVehicle(null); }}
          onSaved={() => { setShowModal(false); setEditingVehicle(null); loadVehicles(); }}
        />
      )}
    </div>
  );
}
