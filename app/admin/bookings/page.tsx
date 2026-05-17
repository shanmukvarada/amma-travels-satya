'use client';

import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Booking } from '@/lib/db';
import { useUIStore } from '@/store/uiStore';
import { Check, X, Car, RefreshCcw } from 'lucide-react';

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const { setToast } = useUIStore();

  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
    });
    return () => unsub();
  }, []);

  const updateStatus = async (booking: Booking, newStatus: string) => {
    try {
      const batch = writeBatch(db);
      
      const bRef = doc(db, 'bookings', booking.id);
      batch.update(bRef, { status: newStatus, updatedAt: new Date().toISOString() });

      const vRef = doc(db, 'vehicles', booking.vehicleId);
      if (newStatus === 'approved' || newStatus === 'active') {
        batch.update(vRef, { isAvailable: false, updatedAt: new Date().toISOString() });
      } else if (newStatus === 'returned' || newStatus === 'rejected') {
        batch.update(vRef, { isAvailable: true, updatedAt: new Date().toISOString() });
      }

      await batch.commit();
      setToast(`Booking marked as ${newStatus}`, 'success');
    } catch (err: any) {
      setToast(err.message, 'error');
    }
  };

  const getStatusBadge = (s: string) => {
    switch(s) {
      case 'pending': return 'bg-orange-100 text-orange-800';
      case 'approved': return 'bg-blue-100 text-blue-800';
      case 'active': return 'bg-green-100 text-green-800';
      case 'returned': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">Manage Bookings</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Vehicle ID</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Docs</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr key={b.id} className="bg-white border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">{b.customerName}</div>
                    <div className="text-xs">{b.customerPhone}</div>
                  </td>
                  <td className="px-6 py-4 text-xs font-mono">{b.vehicleId}</td>
                  <td className="px-6 py-4">
                    <div className="whitespace-nowrap">{b.startDate} to</div>
                    <div className="whitespace-nowrap">{b.endDate}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(b.status)}`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                       <a href={b.aadhaarUrl} target="_blank" className="text-accent hover:underline">Aadhaar</a>
                       <a href={b.licenseUrl} target="_blank" className="text-accent hover:underline">License</a>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      {b.status === 'pending' && (
                        <>
                          <button title="Approve" onClick={() => updateStatus(b, 'approved')} className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Check className="w-4 h-4"/></button>
                          <button title="Reject" onClick={() => updateStatus(b, 'rejected')} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><X className="w-4 h-4"/></button>
                        </>
                      )}
                      {b.status === 'approved' && (
                        <button title="Mark Active" onClick={() => updateStatus(b, 'active')} className="p-1.5 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"><Car className="w-4 h-4"/></button>
                      )}
                      {b.status === 'active' && (
                        <button title="Mark Returned" onClick={() => updateStatus(b, 'returned')} className="p-1.5 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-200"><RefreshCcw className="w-4 h-4"/></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
