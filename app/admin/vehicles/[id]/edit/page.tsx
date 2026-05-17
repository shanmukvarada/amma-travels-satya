'use client';

import { VehicleForm } from '@/components/VehicleForm';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Vehicle } from '@/lib/types';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function EditVehiclePage() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadVehicle() {
      if (!id) return;
      const docRef = doc(db, 'vehicles', id as string);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVehicle({ id: docSnap.id, ...docSnap.data() } as Vehicle);
      }
      setLoading(false);
    }
    loadVehicle();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!vehicle) return <div>Vehicle not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Edit Vehicle</h1>
      <VehicleForm initialData={vehicle} isEdit />
    </div>
  );
}
