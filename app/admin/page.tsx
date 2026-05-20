 'use client';

import { useState, useEffect } from 'react';
import { Vehicle } from '@/lib/types';
import { VehicleFormModal } from '@/components/VehicleFormModal';
import { Loader2, Edit, Power, Trash2, ShieldAlert, Car, CalendarClock, ExternalLink, Download } from 'lucide-react';

export default function AdminVehiclesPage() {
  const [activeTab, setActiveTab] = useState<'vehicles' | 'bookings'>('vehicles');
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [vRes, bRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/bookings')
      ]);
      const vData = await vRes.json();
      const bData = await bRes.json();
      
      setVehicles(Array.isArray(vData) ? vData as Vehicle[] : []);
      setBookings(Array.isArray(bData) ? bData : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const toggleStatus = async (v: Vehicle) => {
    if (!v.id) return;
    const newStatus = v.status === 'Available' ? 'Unavailable' : 'Available';
    await fetch(`/api/vehicles?id=${encodeURIComponent(v.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    loadData();
  };

  const seedVehicles = async () => {
    try {
      setLoading(true);
      const sampleVehicles = [
        {
          name: 'Toyota Innova Crysta',
          model: '2.4 GX 8 STR',
          year: 2023,
          registrationNumber: 'TS09EX1234',
          status: 'Available',
          seatingCapacity: 8,
          fuelType: 'Diesel',
          transmission: 'Manual',
          features: ['AC', 'Power Windows', 'Airbags', 'Bluetooth'],
          images: [
            'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1549317661-460d3d3a0172?auto=format&fit=crop&q=80&w=800'
          ],
          pricingTiers: [
            { id: '1', hours: 4, price: 1500, kmLimit: 40 },
            { id: '2', hours: 8, price: 2500, kmLimit: 80 }
          ]
        },
        {
          name: 'Maruti Suzuki Swift',
          model: 'VXI',
          year: 2022,
          registrationNumber: 'TS07AX9876',
          status: 'Available',
          seatingCapacity: 5,
          fuelType: 'Petrol',
          transmission: 'Manual',
          features: ['AC', 'Music System', 'Power Steering'],
          images: [
            'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=800'
          ],
          pricingTiers: [
            { id: '3', hours: 4, price: 800, kmLimit: 40 },
            { id: '4', hours: 8, price: 1500, kmLimit: 80 }
          ]
        },
        {
          name: 'Hyundai Creta',
          model: 'SX Opt',
          year: 2023,
          registrationNumber: 'TS08BX4567',
          status: 'Available',
          seatingCapacity: 5,
          fuelType: 'Diesel',
          transmission: 'Automatic',
          features: ['Sunroof', 'Touchscreen', 'Ventilated Seats', '6 Airbags'],
          images: [
            'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fd?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=800'
          ],
          pricingTiers: [
            { id: '5', hours: 8, price: 3000, kmLimit: 80 },
            { id: '6', hours: 12, price: 4500, kmLimit: 120 }
          ]
        },
        {
          name: 'Mahindra Thar',
          model: 'LX 4-Str Hard Top',
          year: 2024,
          registrationNumber: 'TS10CX1122',
          status: 'Available',
          seatingCapacity: 4,
          fuelType: 'Diesel',
          transmission: 'Automatic',
          features: ['4x4', 'Touchscreen', 'Alloy Wheels'],
          images: [
            'https://images.unsplash.com/photo-1605810730811-4da29afb1b68?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1605810730419-ac02a1d25246?auto=format&fit=crop&q=80&w=800'
          ],
          pricingTiers: [
            { id: '7', hours: 8, price: 3500, kmLimit: 80 },
            { id: '8', hours: 12, price: 5000, kmLimit: 120 }
          ]
        },
        {
          name: 'Kia Seltos',
          model: 'GTX Plus',
          year: 2023,
          registrationNumber: 'TS09DX3344',
          status: 'Available',
          seatingCapacity: 5,
          fuelType: 'Petrol',
          transmission: 'Automatic',
          features: ['Bose Audio', 'HUD', 'Sunroof', 'Air Purifier'],
          images: [
            'https://images.unsplash.com/photo-1590362891991-f7615b3eafc1?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1590362892900-5c68b57116b4?auto=format&fit=crop&q=80&w=800'
          ],
          pricingTiers: [
            { id: '9', hours: 4, price: 1200, kmLimit: 40 },
            { id: '10', hours: 8, price: 2200, kmLimit: 80 }
          ]
        },
        {
          name: 'Tata Safari',
          model: 'Accomplished Plus',
          year: 2024,
          registrationNumber: 'TS12EX5566',
          status: 'Available',
          seatingCapacity: 7,
          fuelType: 'Diesel',
          transmission: 'Automatic',
          features: ['Panoramic Sunroof', 'ADAS', 'JBL Audio', 'Ventilated Seats'],
          images: [
            'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1606132717871-33758b9cf6ad?auto=format&fit=crop&q=80&w=800'
          ],
          pricingTiers: [
            { id: '11', hours: 8, price: 4000, kmLimit: 80 },
            { id: '12', hours: 12, price: 5500, kmLimit: 120 }
          ]
        }
      ];

      for (const vehicle of sampleVehicles) {
        await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicle),
        });
      }
      loadData();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteVehicle = async (v: Vehicle) => {
    if (!v.id) return;
    if (confirm(`Are you sure you want to delete ${v.name}?`)) {
      await fetch(`/api/vehicles?id=${encodeURIComponent(v.id)}`, { method: 'DELETE' });
      loadData();
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" size={32} /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-xl shadow-inner">
          <button 
            onClick={() => setActiveTab('vehicles')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'vehicles' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <Car size={16} className="mr-2" /> Vehicles
          </button>
          <button 
            onClick={() => setActiveTab('bookings')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'bookings' ? 'bg-white text-red-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <CalendarClock size={16} className="mr-2" /> Bookings
          </button>
        </div>
      </div>

      {activeTab === 'vehicles' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-800">Inventory Manager</h2>
            <div className="flex gap-2">
              {vehicles.length === 0 && (
                <button 
                  onClick={seedVehicles}
                  className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-gray-900 shadow-sm transition-colors"
                >
                  Seed Data
                </button>
              )}
              <button 
                onClick={() => { setEditingVehicle(null); setShowModal(true); }}
                className="bg-red-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-red-700 shadow-sm transition-colors"
              >
                + Add Vehicle
              </button>
            </div>
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
                  <div className={`absolute top-3 left-3 px-2 py-1 text-xs font-bold rounded-lg ${v.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
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
                    <button onClick={() => toggleStatus(v)} className="flex flex-col items-center justify-center py-2 bg-gray-50 hover:bg-amber-50 text-gray-600 hover:text-amber-600 rounded-lg text-xs font-medium transition-colors">
                      <ShieldAlert size={16} className="mb-1" /> {v.status === 'Available' ? 'Unavailable' : 'Available'}
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
        </>
      )}

      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="p-4 font-bold text-gray-700 text-sm">Date</th>
                  <th className="p-4 font-bold text-gray-700 text-sm">Customer Details</th>
                  <th className="p-4 font-bold text-gray-700 text-sm">Vehicle</th>
                  <th className="p-4 font-bold text-gray-700 text-sm">Package</th>
                  <th className="p-4 font-bold text-gray-700 text-sm">Documents</th>
                  <th className="p-4 font-bold text-gray-700 text-sm">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.length > 0 ? bookings.map((b) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">
                      {new Date(b.createdAt).toLocaleDateString()} <br />
                      <span className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleTimeString()}</span>
                    </td>
                    <td className="p-4">
                      <p className="font-bold text-gray-900">{b.customerName}</p>
                      <p className="text-sm text-gray-600">{b.customerPhone}</p>
                      <p className="text-xs text-gray-400 mt-1 truncate max-w-[150px]" title={b.address}>{b.address}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-gray-800">{b.vehicleName}</p>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <p>{b.hours} hrs / {b.kmLimit} km</p>
                      <p className="font-semibold text-red-600 mr-2">₹{b.price}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {b.aadharUrl && (
                          <a href={b.aadharUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100 border border-blue-100">
                            Aadhaar <ExternalLink size={12} className="ml-1" />
                          </a>
                        )}
                        {b.dlUrl && (
                          <a href={b.dlUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100 border border-indigo-100">
                            DL <ExternalLink size={12} className="ml-1" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${
                        b.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {b.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-500">
                      No bookings found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <VehicleFormModal 
          vehicleToEdit={editingVehicle}
          onClose={() => { setShowModal(false); setEditingVehicle(null); }}
          onSaved={() => { setShowModal(false); setEditingVehicle(null); loadData(); }}
        />
      )}
    </div>
  );
}
