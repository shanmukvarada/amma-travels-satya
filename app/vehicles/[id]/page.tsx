'use client';

import { use, useState, useEffect } from 'react';
import Image from 'next/image';
import { getVehicle, Vehicle, createBooking, uploadFile } from '@/lib/db';
import { useUIStore } from '@/store/uiStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { signInAnonymously } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Users, Fuel, Settings, CheckCircle2, Upload, Calendar } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const bookingSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  customerPhone: z.string().min(10, "Valid phone is required"),
  customerAddress: z.string().min(10, "Full address is required"),
  startDate: z.string().min(1, "Start date required"),
  endDate: z.string().min(1, "End date required"),
  aadhaarFile: z.any().refine((files) => files?.length == 1, "Aadhaar image is required."),
  licenseFile: z.any().refine((files) => files?.length == 1, "Driving License image is required.")
});

type BookingFormValues = z.infer<typeof bookingSchema>;

export default function VehicleDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { setToast } = useUIStore();
  const [totalCost, setTotalCost] = useState(0);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
  });

  const startDate = watch('startDate');
  const endDate = watch('endDate');

  useEffect(() => {
    getVehicle(id).then(v => {
      setVehicle(v);
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (startDate && endDate && vehicle) {
      const days = differenceInDays(parseISO(endDate), parseISO(startDate));
      if (days >= 0) {
        setTotalCost((days === 0 ? 1 : days) * vehicle.pricePerDay);
      } else {
        setTotalCost(0);
      }
    }
  }, [startDate, endDate, vehicle]);

  const onSubmit = async (data: BookingFormValues) => {
    if (!vehicle || !vehicle.isAvailable) {
      setToast('Vehicle is not available', 'error');
      return;
    }
    
    const days = differenceInDays(parseISO(data.endDate), parseISO(data.startDate));
    if (days < 0) {
      setToast('End date must be after start date', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (!auth.currentUser) {
        await signInAnonymously(auth);
      }

      const aadhaarFile = data.aadhaarFile[0] as File;
      const licenseFile = data.licenseFile[0] as File;
      
      const [aadhaarUrl, licenseUrl] = await Promise.all([
        uploadFile(aadhaarFile, `documents/aadhaar`),
        uploadFile(licenseFile, `documents/license`)
      ]);

      const cost = (days === 0 ? 1 : days) * vehicle.pricePerDay;

      const bookingId = await createBooking({
        vehicleId: id,
        startDate: data.startDate,
        endDate: data.endDate,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        aadhaarUrl,
        licenseUrl,
        totalCost: cost
      });

      if (bookingId) {
        setToast('Booking request submitted successfully! We will contact you soon.', 'success');
        setTimeout(() => window.location.href = '/', 3000);
      } else {
        throw new Error('Failed to create booking');
      }
    } catch (error: any) {
      setToast(error.message || 'An error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="min-h-screen pt-24 text-center">Loading...</div>;
  if (!vehicle) return <div className="min-h-screen pt-24 text-center">Vehicle not found</div>;

  return (
    <div className="w-full bg-gray-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-4 lg:p-8 bg-gray-50/50">
              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-md bg-gray-200 mb-4">
                <Image 
                  src={vehicle.images?.[0] || `https://picsum.photos/seed/${vehicle.id}/1200/900`} 
                  alt={vehicle.name}
                  fill
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                {(vehicle.images?.slice(1, 4) || [1,2,3]).map((img, i) => (
                  <div key={i} className="relative aspect-video rounded-xl overflow-hidden bg-gray-200 opacity-60 hover:opacity-100 cursor-pointer transition-opacity">
                    <Image src={typeof img === 'string' ? img : `https://picsum.photos/seed/${id}${i}/400/300`} fill className="object-cover" referrerPolicy="no-referrer" alt="" />
                  </div>
                ))}
              </div>
              
              <div className="mt-10">
                <h3 className="text-2xl font-heading font-bold text-primary mb-4">Features Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center text-gray-700 bg-white p-3 rounded-xl border border-gray-100"><Users className="w-5 h-5 mr-3 text-accent"/> {vehicle.seatingCapacity} Seater</div>
                  <div className="flex items-center text-gray-700 bg-white p-3 rounded-xl border border-gray-100"><Fuel className="w-5 h-5 mr-3 text-accent"/> {vehicle.fuelType}</div>
                  <div className="flex items-center text-gray-700 bg-white p-3 rounded-xl border border-gray-100"><Settings className="w-5 h-5 mr-3 text-accent"/> {vehicle.transmission}</div>
                  <div className="flex items-center text-gray-700 bg-white p-3 rounded-xl border border-gray-100"><CheckCircle2 className="w-5 h-5 mr-3 text-accent"/> {vehicle.type.toUpperCase()}</div>
                </div>
                
                <h3 className="text-xl font-heading font-bold text-primary mt-8 mb-3">Vehicle Details</h3>
                <p className="text-gray-600 leading-relaxed">{vehicle.description || "A premium vehicle maintained in pristine condition, ready for your next adventure."}</p>
                
                {vehicle.features && vehicle.features.length > 0 && (
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {vehicle.features.map(f => (
                      <li key={f} className="bg-primary/5 text-primary text-sm font-medium px-4 py-1.5 rounded-full">{f}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="p-6 lg:p-12 border-l border-gray-100">
              <div className="mb-8">
                <h1 className="text-3xl lg:text-4xl font-heading font-bold text-primary mb-2">{vehicle.brand} {vehicle.model}</h1>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-accent">₹{vehicle.pricePerDay}</span>
                  <span className="text-gray-500 font-medium">/ day</span>
                </div>
                <div className="mt-2 inline-flex items-center text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                   Security Deposit: ₹{vehicle.securityDeposit}
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 mb-8">
                <h3 className="text-xl font-heading font-bold text-primary mb-6">Booking Request</h3>
                
                {!vehicle.isAvailable ? (
                  <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center font-medium">
                    This vehicle is currently not available for booking.
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Pickup Date</label>
                        <input type="date" {...register('startDate')} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50" />
                        {errors.startDate && <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Return Date</label>
                        <input type="date" {...register('endDate')} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50" />
                        {errors.endDate && <p className="text-red-500 text-xs mt-1">{errors.endDate.message}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Name</label>
                      <input type="text" {...register('customerName')} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50" placeholder="John Doe" />
                      {errors.customerName && <p className="text-red-500 text-xs mt-1">{errors.customerName.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                      <input type="tel" {...register('customerPhone')} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50" placeholder="+91 9876543210" />
                      {errors.customerPhone && <p className="text-red-500 text-xs mt-1">{errors.customerPhone.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1">Full Address</label>
                      <textarea {...register('customerAddress')} rows={2} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-accent/50" placeholder="123 Street, Area, City" />
                      {errors.customerAddress && <p className="text-red-500 text-xs mt-1">{errors.customerAddress.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                       <div className="bg-white border border-dashed border-gray-300 rounded-xl p-4 text-center">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <label className="block text-sm font-semibold text-primary cursor-pointer">
                            Upload Aadhaar
                            <input type="file" accept="image/*" {...register('aadhaarFile')} className="hidden" />
                          </label>
                          <p className="text-[10px] text-gray-400 mt-1">{watch('aadhaarFile')?.[0]?.name || "JPG, PNG (Max 5MB)"}</p>
                          {errors.aadhaarFile && <p className="text-red-500 text-xs mt-1">{errors.aadhaarFile.message as string}</p>}
                       </div>
                       
                       <div className="bg-white border border-dashed border-gray-300 rounded-xl p-4 text-center">
                          <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                          <label className="block text-sm font-semibold text-primary cursor-pointer">
                            Upload License
                            <input type="file" accept="image/*" {...register('licenseFile')} className="hidden" />
                          </label>
                          <p className="text-[10px] text-gray-400 mt-1">{watch('licenseFile')?.[0]?.name || "JPG, PNG (Max 5MB)"}</p>
                          {errors.licenseFile && <p className="text-red-500 text-xs mt-1">{errors.licenseFile.message as string}</p>}
                       </div>
                    </div>

                    {totalCost > 0 && (
                      <div className="bg-primary/5 p-4 rounded-xl mt-4 flex justify-between items-center">
                        <span className="font-semibold text-primary">Estimated Rental Cost:</span>
                        <span className="font-bold text-xl text-primary">₹{totalCost}</span>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="w-full py-4 rounded-xl bg-accent text-white font-bold text-lg hover:bg-accent-hover transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg shadow-accent/20"
                    >
                      {submitting ? 'Submitting...' : 'Request Booking'}
                    </button>
                    <p className="text-xs text-center text-gray-500 mt-3">By booking, you agree to our terms and conditions. The security deposit will be collected at pickup.</p>
                  </form>
                )}
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
