import { collection, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';

export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  type: 'car' | 'bike';
  fuelType: 'Petrol' | 'Diesel' | 'EV' | 'Hybrid';
  seatingCapacity: number;
  transmission: 'Manual' | 'Automatic';
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
  userId: string;
  vehicleId: string;
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'active' | 'returned';
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  aadhaarUrl: string;
  licenseUrl: string;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
}

// ============== VEHICLES ==============

export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const snapshot = await getDocs(collection(db, 'vehicles'));
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Vehicle));
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  try {
    const d = await getDoc(doc(db, 'vehicles', id));
    if (!d.exists()) return null;
    return { id: d.id, ...d.data() } as Vehicle;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function createBooking(data: Omit<Booking, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'userId'>): Promise<string> {
  try {
    if (!auth.currentUser) throw new Error('User not authenticated');
    
    const newDocRef = doc(collection(db, 'bookings'));
    const now = new Date().toISOString();
    
    // Server expects matching schema
    const payload = {
      ...data,
      userId: auth.currentUser.uid,
      status: 'pending',
      createdAt: now,
      updatedAt: now
    };
    
    await setDoc(newDocRef, payload);
    return newDocRef.id;
  } catch (error) {
    console.error(error);
    return "";
  }
}

export function listenToUserBookings(userId: string, callback: (bookings: Booking[]) => void) {
  const q = query(collection(db, 'bookings'), where('userId', '==', userId));
  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking)));
  }, (error) => {
    console.error(error);
  });
}

// Admins only
export async function getPendingBookings(): Promise<Booking[]> {
  try {
    const q = query(collection(db, 'bookings'), where('status', '==', 'pending'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
  } catch (error) {
    console.error(error);
    return [];
  }
}

// Upload file to Firebase Storage
export async function uploadFile(file: File, path: string): Promise<string> {
  if (!auth.currentUser) throw new Error("Must be logged in to upload files.");
  const storageRef = ref(storage, `${path}/${auth.currentUser.uid}_${Date.now()}_${file.name}`);
  const snapshot = await uploadBytesResumable(storageRef, file);
  return await getDownloadURL(snapshot.ref);
}
