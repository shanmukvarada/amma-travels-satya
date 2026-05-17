'use client';

import { VehicleForm } from '@/components/VehicleForm';

export default function NewVehiclePage() {
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Add New Vehicle</h1>
      <VehicleForm />
    </div>
  );
}
