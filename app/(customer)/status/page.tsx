'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Booking } from '@/lib/types';
import { Loader2, CheckCircle2, Clock, MapPin, XCircle, FileText } from 'lucide-react';
import { format } from 'date-fns';

export default function StatusPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem('my_bookings') || '[]');
        if (stored.length === 0) {
          setLoading(false);
          return;
        }

        const data: Booking[] = [];
        for (const id of stored) {
          const d = await getDoc(doc(db, 'bookings', id));
          if (d.exists()) {
            data.push({ id: d.id, ...d.data() } as Booking);
          }
        }
        
        // sort by newest
        data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setBookings(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-red-600" size={32} /></div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-gray-900 mb-8">My Bookings</h1>
      
      {bookings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500 shadow-sm">
          <FileText size={48} className="mx-auto mb-4 text-gray-300" />
          <p>You have no recent bookings.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {bookings.map(b => (
            <div key={b.id} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-6">
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg text-gray-900">{b.vehicleName}</h3>
                  <StatusBadge status={b.status} />
                </div>
                
                <div className="text-sm text-gray-600 space-y-1 mb-4">
                  <p><strong>Package:</strong> {b.selectedTier?.hours} Hrs - {b.selectedTier?.kmLimit} km limit</p>
                  <p><strong>Price:</strong> ₹{b.totalPrice}</p>
                  <p><strong>Date:</strong> {format(new Date(b.createdAt), 'PP p')}</p>
                </div>

                {b.status === 'Pending' && (
                  <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-sm border border-amber-100 flex items-start gap-2">
                    <Clock size={16} className="mt-0.5" />
                    <p>Your request is pending owner confirmation. We will contact you at {b.customerPhone} shortly.</p>
                  </div>
                )}
                {b.status === 'Approved' && (
                  <div className="bg-green-50 text-green-800 p-3 rounded-lg text-sm border border-green-100 flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5" />
                    <p>Booking approved! Please visit our location or call us to complete payment and pickup.</p>
                  </div>
                )}
                {b.status === 'Active' && (
                  <div className="bg-red-50 text-red-800 p-3 rounded-lg text-sm border border-red-100 flex items-start gap-2">
                    <MapPin size={16} className="mt-0.5" />
                    <p>Vehicle is currently active. Drive safe!</p>
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    Pending: 'bg-amber-100 text-amber-800 border-amber-200',
    Approved: 'bg-green-100 text-green-800 border-green-200',
    Active: 'bg-red-100 text-red-800 border-red-200',
    Returned: 'bg-gray-100 text-gray-800 border-gray-200',
    Cancelled: 'bg-red-100 text-red-800 border-red-200',
  };
  
  return (
    <span className={`px-2.5 py-1 rounded text-xs font-bold border ${styles[status]}`}>
      {status}
    </span>
  );
}
