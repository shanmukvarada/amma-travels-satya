'use client';

import { useEffect, useState } from 'react';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Car, CalendarCheck, Clock, CheckCircle } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalVehicles: 0,
    totalBookings: 0,
    pendingBookings: 0,
    activeBookings: 0,
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const p1 = getCountFromServer(collection(db, 'vehicles'));
        const p2 = getCountFromServer(collection(db, 'bookings'));
        const p3 = getCountFromServer(query(collection(db, 'bookings'), where('status', '==', 'pending')));
        const p4 = getCountFromServer(query(collection(db, 'bookings'), where('status', '==', 'active')));
        
        const [r1, r2, r3, r4] = await Promise.all([p1, p2, p3, p4]);
        
        setStats({
          totalVehicles: r1.data().count,
          totalBookings: r2.data().count,
          pendingBookings: r3.data().count,
          activeBookings: r4.data().count,
        });
      } catch (err) {
        console.error('Failed to load stats', err);
      }
    }
    loadStats();
  }, []);

  const cards = [
    { title: 'Total Vehicles', value: stats.totalVehicles, icon: Car, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Total Bookings', value: stats.totalBookings, icon: CalendarCheck, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { title: 'Pending Approvals', value: stats.pendingBookings, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
    { title: 'Active Rentals', value: stats.activeBookings, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  return (
    <div className="p-8">
      <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
            <div className={`p-4 rounded-xl ${c.bg} mr-4`}>
              <c.icon className={`w-8 h-8 ${c.color}`} />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium">{c.title}</p>
              <h3 className="text-3xl font-bold text-gray-900">{c.value}</h3>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
