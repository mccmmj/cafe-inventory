export interface Vendor {
  id: string;
  name: string;
  moq: number; // Minimum Order Quantity (dollars or units)
  contactInfo?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  unit: string;
  currentStock: number;
  pricePerUnit: number;
  isSuggestedPadding?: boolean;
  vendorOptions: string[];
  selectedVendor: string;
  selected: boolean;
}

export interface Order {
  id: string;
  vendorId: string;
  vendorName: string;
  items: OrderItem[];
  status: 'draft' | 'submitted' | 'in_process' | 'rejected' | 'fulfilled' | 'fulfillment' | 'complete';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  submittedBy?: string;
  updatedBy?: string;
  inProcess: boolean;
  rejected: boolean;
  moqMet: boolean;
  notes?: string;
  receivedItems?: string; // JSON stringified array of received items
} 