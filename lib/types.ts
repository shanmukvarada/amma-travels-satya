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
  extraKmFee: number;
}

export interface Booking {
  id?: string;
  vehicleId: string;
  vehicleName: string;
  customerName: string;
  customerPhone: string;
  address: string;
  aadharUrl: string;
  dlUrl: string;
  status: 'Pending' | 'Approved' | 'Active' | 'Returned' | 'Cancelled';
  startDate: string; // ISO string
  endDate?: string;
  selectedTier: PricingTier;
  totalPrice: number;
  createdAt: string;
}

export interface BusinessConfig {
  companyName: string;
  phone: string;
  address: string;
  alertBanner?: string;
}
