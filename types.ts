export type UserRole = 'admin' | 'employee';

export interface Employee {
  id: string;
  name: string;
  role: 'Store Admin' | 'Senior Cashier' | 'Junior Cashier' | 'Stock Clerk';
  phone: string;
  pin: string;
  salesCountToday: number;
  totalSalesToday: number;
  activeShift: boolean;
  avatarColor: string;
}

export type TransactionType = 'sale' | 'expense';

export type ExpenseCategory = 'Stock' | 'Rent' | 'Salary' | 'Electricity' | 'Other';
export type SaleCategory = 'Grocery' | 'Beverages' | 'Dairy & Fresh' | 'Snacks & Sweets' | 'Household' | 'Personal Care' | 'Other';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  trn?: string;
  creditBalance: number; // Positive = customer owes shop (Udhar/Khata)
  totalSpent: number;
  lastPurchaseDate?: string;
}

export type ItemUnit = 'kg' | 'pcs' | 'liter' | 'pack' | 'box' | 'bag' | 'can';

export interface GroceryItem {
  id: string;
  name: string;
  nameArabic?: string;
  category: SaleCategory;
  price: number; // Price in AED
  unit: ItemUnit;
  stockQty: number;
  barcode?: string;
  icon?: string;
}

export interface CartItem {
  itemId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  unit: ItemUnit;
  itemDiscount: number; // Discount per line or total in AED
  total: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  invoiceNumber?: string;
  title: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  cashierName?: string;
  items?: CartItem[];
  subtotal: number;
  discountType?: 'fixed' | 'percent';
  discountValue?: number;
  discountAmount: number;
  vatAmount: number; // 5% UAE VAT
  amount: number; // Grand total including VAT
  category: string;
  paymentMethod: 'Cash' | 'Card' | 'Credit / Khata' | 'Bank Transfer';
  date: string; // e.g. "Today, 2:30 PM"
  rawDate: string; // ISO date
  time?: string;
  merchant?: string;
  notes?: string;
}

export type TimeFilter = 'Today' | 'This Week' | 'This Month' | 'This Year';

export type Language =
  | 'English'
  | 'Arabic (العربية)'
  | 'Hindi (हिंदी)'
  | 'Urdu (اردو)'
  | 'Malayalam (മലയാളം)';

export interface BusinessProfile {
  shopName: string;
  shopNameArabic?: string;
  trn: string;
  ownerName: string;
  phone: string;
  address: string;
  salesThisMonth: number;
  expensesThisMonth: number;
  rollingTurnover: number;
  vatThreshold: number; // AED 375,000 mandatory
  voluntaryThreshold: number; // AED 187,500 voluntary
  whatsappReminders: boolean;
  language: Language;
  currency: string;
}

export type ActiveTab =
  | 'home'
  | 'admin-dashboard'
  | 'pos'
  | 'inventory'
  | 'customers'
  | 'ledger'
  | 'employees'
  | 'settings'
  | 'vat-report'
  | 'register-shift'
  | 'camera-scan';

