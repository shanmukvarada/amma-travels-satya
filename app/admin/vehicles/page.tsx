'use client';

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Vehicle } from '@/lib/types';
import Link from 'next/link';
import { VehicleFormModal } from '@/components/VehicleFormModal';

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    setLoading(true);
    const querySnapshot = await getDocs(collection(db, 'vehicles'));
    const data: Vehicle[] = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() } as Vehicle);
    });
    setVehicles(data);
    setLoading(false);
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault(); // In case it's in a link
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    await deleteDoc(doc(db, 'vehicles', id));
    loadVehicles();
  };

  const toggleStatus = async (vehicle: Vehicle) => {
    if (!vehicle.id) return;
    const newStatus = vehicle.status === 'Available' ? 'Maintenance' : 'Available';
    await updateDoc(doc(db, 'vehicles', vehicle.id), { status: newStatus });
    loadVehicles();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
        <button 
          onClick={() => {
            setEditingVehicle(null);
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700"
        >
          + Add Vehicle
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <div key={v.id} className="bg-white border text-gray-800 border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="h-48 bg-gray-200 relative">
              {v.images && v.images.length > 0 ? (
                <img src={v.images[0]} alt={v.name} className="w-full h-full object-cover" />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">No Image</div>
              )}
              <div className="absolute top-2 right-2 flex gap-2">
                <span className={`px-2 py-1 text-xs font-bold rounded ${
                  v.status === 'Available' ? 'bg-green-100 text-green-800' :
                  v.status === 'Booked' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {v.status}
                </span>
                <span className="px-2 py-1 text-xs font-bold rounded bg-gray-800 text-white">{v.type}</span>
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <h2 className="text-xl font-bold mb-1">{v.name} <span className="text-gray-500 font-normal text-sm">({v.year})</span></h2>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{v.description}</p>
              <div className="mt-auto flex gap-2 w-full">
                <button 
                  onClick={() => {
                    setEditingVehicle(v);
                    setShowModal(true);
                  }}
                  className="flex-1 bg-gray-100 text-center text-gray-700 py-1.5 rounded text-sm font-medium hover:bg-gray-200"
                >
                  Edit
                </button>
                <button 
                  onClick={() => toggleStatus(v)}
                  className="flex-1 bg-gray-100 text-center text-gray-700 py-1.5 rounded text-sm font-medium hover:bg-gray-200"
                >
                  {v.status === 'Available' ? 'Disable' : 'Enable'}
                </button>
                <button 
                  onClick={(e) => handleDelete(v.id as string, e)}
                  className="bg-red-50 text-red-600 px-3 py-1.5 rounded text-sm font-medium hover:bg-red-100"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {vehicles.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No vehicles found. Add one to get started.
        </div>
      )}

      {showModal && (
        <VehicleFormModal 
          vehicleToEdit={editingVehicle}
          onClose={() => {
            setShowModal(false);
            setEditingVehicle(null);
          }}
          onSaved={() => {
            setShowModal(false);
            setEditingVehicle(null);
            loadVehicles();
          }}
        />
      )}
    </div>
  );
}
