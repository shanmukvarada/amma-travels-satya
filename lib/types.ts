export interface PricingTier {
  id: string;
  hours: number;
  price: number;
  kmLimit: number;
}

export interface Vehicle {
  id?: string;
  name: string;
  model: string;
  type: 'Car' | 'Bike';
  year: number;
  fuelType: string;
  seatingCapacity: number;
  description: string;
  images: string[];
  status: 'Available' | 'Booked' | 'Maintenance';
  pricingTiers: PricingTier[];
  extraKmFee?: number;
}

export interface Booking {
  id?: string;
  customerName: string;
  phone: string;
  address: string;
  aadhaarUrl: string;
  dlUrl: string;
  vehicleId: string;
  selectedTier: PricingTier;
  totalBasePrice: number;
  status: 'Pending' | 'Active' | 'Completed';
  startTime: string; // ISO string
  endTime: string;   // ISO string
  returnKm?: number;
  extraKmFee?: number;
}

export interface BusinessConfig {
  id?: string;
  companyName: string;
  phone: string;
  address: string;
  alertBanner?: string;
  extraFeePerKm: number;
}
