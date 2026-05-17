import { db } from './firebase';
import { collection, getDocs, getDoc, doc, addDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: string;
  fuelType: string;
  seatingCapacity: number;
  transmission: string;
  registrationNumber: string;
  pricePerDay: number;
  securityDeposit: number;
  description: string;
  features: string[];
  images: string[];
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  aadhaarUrl: string;
  licenseUrl: string;
  totalCost: number;
  status: 'pending' | 'approved' | 'active' | 'returned' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export async function getVehicles(): Promise<Vehicle[]> {
  const snap = await getDocs(collection(db, 'vehicles'));
  return snap.docs.map(d => ({id: d.id, ...d.data()} as Vehicle));
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const snap = await getDoc(doc(db, 'vehicles', id));
  if (!snap.exists()) return null;
  return {id: snap.id, ...snap.data()} as Vehicle;
}

export async function createBooking(data: Partial<Booking>): Promise<string> {
  const refDoc = await addDoc(collection(db, 'bookings'), {
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  return refDoc.id;
}

export async function uploadFile(file: File, path: string): Promise<string> {
  const storage = getStorage();
  const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}
