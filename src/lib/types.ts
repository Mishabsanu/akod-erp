export type PermissionActions = {
  view: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
};

export type RolePermissions = {
  [module: string]: PermissionActions;
};

export interface Role {
  _id?: string;
  name: string;
  status: 'active' | 'inactive';
  permissions: RolePermissions;
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id?: string;
  email: string;
  role?: string | Role;
  name: string;
  mobile: string;
  status: string;
  password?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserFilter {
  search?: string;
  role?: string;
  status?: 'active' | 'inactive';
}

export interface RoleFilter {
  search?: string;
  role?: string;
  status?: 'active' | 'inactive';
}

export interface FollowUpEntry {
  status: string;
  notes?: string;
  remarks?: string;
  followUpDate?: string;
  date: string; // Date of this follow-up
  nextFollowUpDate?: string;
  updatedBy?: {
    _id: string;
    name: string;
  };
}

export interface SaleUser {
  _id?: string;
  name?: string;
}

export interface Vendor {
  _id?: string;
  name: string;
  company: string;
  email: string;
  mobile: string;
  status: 'active' | 'inactive';
  address?: string;
  pincode?: string;
  city?: string;
  district?: string;
  state?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonMobile?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendorFilter {
  search?: string;
  status?: 'active' | 'inactive';
}

export interface Customer {
  _id?: string;
  name: string;
  company: string;
  email: string;
  mobile: string;
  status: 'active' | 'inactive';
  address?: string;
  pincode?: string;
  city?: string;
  district?: string;
  state?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonMobile?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerFilter {
  search?: string;
  status?: 'active' | 'inactive';
}

export interface LineItem {
  productId?: string;
  name?: string;
  unit?: string;
  itemCode?: string;
  description?: string;
  quantity: number;
  availableQty?: number;
  requiredQty?: number;
  totalReturnedQty?: number;
  returnQty?: number;
  returnedQty?: string;
}

export interface QuoteLineItem {
  productId?: string;
  name?: string;
  weight: number;
  qty: number;
  price: number; // Base price (INR)
  priceUSD?: number; // USD (display)
  totalWeight?: number;
  totalCost?: number; // Base total cost (price * qty) in INR
  totalCostUSD?: number;
  // shipping fields
  shippingAmount?: number; // total shipping amount for the item (INR) = unitShippingAmount * qty
  shippingPercentage?: number; // per-item shipping % (if manually specified)
  manualShipping?: boolean; // whether item has manual shipping %
  // "unit" derived fields
  unitShippingAmount?: number; // base * (shipping% / 100)  <-- actual shipping amount per unit
  unitPriceWithShipping?: number; // base + unitShippingAmount  <-- the "110" style value user asked to see
  marginPercentage?: number; // margin % for this item
  marginAmount?: number; // per unit margin amount = base * (margin%/100)
  sellingPrice?: number; // per unit final selling price = base + unitShippingAmount + marginAmount
  totalSellingPrice?: number; // sellingPrice * qty
  grossMargin?: number; // marginAmount * qty
  deepPrice?: number;
}
type StockHistoryType =
  | 'ADD_STOCK'
  | 'DELIVERY'
  | 'RETURN'
  | 'RETURN_REVERT'
  | 'DELIVERY_ROLLBACK'
  | 'RETURN_DELETE_ROLLBACK'
  | 'DELIVERY_DELETE_ROLLBACK';
export interface HistoryItem {
  type: StockHistoryType; // ✅ REQUIRED & STRICT
  stock: number; // ✅ REQUIRED
  note?: string;
  date?: string;
  ticketNo?: string;
  customer?: {
    name?: string;
  };
}

export interface ProductFilter {
  search?: string;
  status?: 'active' | 'inactive';
}

export interface Product {
  _id?: string;
  name: string;
  itemCode: string;
  unit: string;
  description: string;
  status: string;
  price: number;
  currency: string;
  moq: string;
  features?: string[];
  size?: string;
  weight?: string;
  material?: string;
  surface?: string;
  coating?: string;
  coatingType?: string;
  voltage?: string;
  wattage?: string;
  package?: string;
  packageType?: string;
  packageQty?: string;
  brand?: string;
  standard?: string;
  certificate?: string;
  madeIn?: string;
  uses?: string;
  customization?: string;
  productAdvantage?: string;
  image?: string;
  model?: string;
  category?: string;
  createdAt?: string;
  updatedAt?: string;
}
export interface PODropdownItem {
  _id: string;
  name: string;
  availableQty: number;
  itemCode: string;
  unit: string;
}
export interface InventoryItem {
  _id: string;
  poNo: string;
  date?: string;
  reference?: string;
  vendor: string;
  product: {
    _id: string;
    name: string;
    itemCode?: string;
    unit: string;
  };
  items: {
    id: string;
    productId: string;
    itemCode: string;
    unit: string;
    stock: number;
  };
  itemCode: string;
  orderedQty: number;
  availableQty: number;
  history: HistoryItem[];
  status: 'OUT_OF_STOCK' | 'LOW_STOCK' | '	IN_STOCK';
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryPayload {
  date: string;
  poNumber: string;
  reference?: string;
  vendor: string;
  items: {
    productId: string;
    itemCode: string;
    unit?: string;
    quantity: number;
  }[];
}
export interface InventoryResponse {
  _id: string;
  poNumber: string;
  product: string;
  itemCode: string;
  orderedQty: number;
  availableQty: number;
  status: 'OUT_OF_STOCK' | 'LOW_STOCK' | '	IN_STOCK';
  createdAt: string;
}

export interface InventoryFilter {
  search?: string;
  status?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  minStock?: number;
  maxStock?: number;
}

export interface DeliveredBy {
  deliveredByName: string;
  deliveredByMobile: string;
  deliveredDate: string;
}

export interface ReceivedBy {
  receivedByName: string;
  receivedByMobile: string;
  qatarId: string;
  receivedDate: string;
}

export interface DeliveryTicket {
  _id?: string;
  customerId: string;
  customerName: string;
  ticketType: string;
  deliveryDate: string;
  ticketNo: string;
  poNo: string;
  invoiceNo: string;
  referenceNo: string;
  subject: string;
  reason?: string;
  projectLocation: string;
  noteCategory: string;
  vehicleNo: string;
  status: 'pending' | 'delivered' | 'cancelled';
  items: LineItem[];
  totalAmount: number;
  deliveredBy: DeliveredBy;
  receivedBy: ReceivedBy;
  quantity: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DeliveryTicketFilter {
  search?: string;
  status?: 'pending' | 'delivered' | 'cancelled';
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
}

export interface ReturnTicket {
  _id?: string;
  customerId: string;
  customerName: string;
  parentTicketNo?: string;
  returnDate: string; // ISO date string
  status: 'pending' | 'processed' | 'rejected';
  items: LineItem[];
  totalAmount: number; // Amount to be refunded/credited
  reason: string;
  deliveredBy: DeliveredBy;
  receivedBy: ReceivedBy;
  createdAt?: string;
  updatedAt?: string;
  ticketType?: string;
  ticketNo: string;
  poNo?: string;
  invoiceNo?: string;
  referenceNo?: string;
  subject?: string;
  projectLocation?: string;
  noteCategory?: string;
  vehicleNo?: string;
  qatarId?: string;
}

export interface ReturnTicketFilter {
  search?: string;
  status?: 'pending' | 'processed' | 'rejected';
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
}

export interface Sale {
  _id?: string;
  companyName: string;
  position: string;
  email: string;
  contactPersonMobile: string;
  contactThrough: string;
  referenceNo: string;
  name: string;
  location: string;
  region: string;
  date: string;
  followUpDate?: string;
  remarks?: string;
  ticketNo?: string;
  status?: string;
  platform?: 'Akod Safe' | 'Akod Tech' | 'Akod Scaffolding' | 'Akod Food' | 'Avoma' | 'Other';
  createdAt?: string;
  updatedAt?: string;
  nextFollowUpDate?: string;
  followUpHistory?: FollowUpEntry[];
  attachments?: string[];
  user?: SaleUser;
  nearestPort?: string;
  businessType?: string;
}

export interface SaleFilter {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  nextFollowUpDate?: string;
}

export interface QuoteTrack {
  _id?: string;
  clientName: string;
  companyName?: string;
  product?: string; 
  email?: string;
  contactPersonMobile?: string;
  contactThrough?: string;
  referenceNo?: string;
  name?: string;
  location?: string;
  region?: string;
  quantity?: number;
  price?: number;
  date?: string;
  followUpDate?: string;
  remarks?: string;
  status: 'Pending' | 'Quoted' | 'Accepted' | 'Rejected';
  marginPercentage?: number;
  deepPrice?: number;
  createdAt?: string;
  updatedAt?: string;
  totalShippingCost?: number;
  totalItemCost?: number;
  totalWeight?: number;
  totalQty?: number;
  totalGrossMargin?: number;
  totalSellingPrice?: number;
  exchangeRate?: number;
  currency?: string;
  items?: QuoteLineItem[];
}

export interface QuoteTrackFilter {
  search?: string;
  status?: 'Pending' | 'Quoted' | 'Rejected';
  currency?: 'INR' | 'USD';
  exchangeRate?: number;
}

export interface RunningOrder {
  _id?: string;
  company_name: string;
  client_name: string;
  ordered_date: string;
  invoice_number: string;
  po_number: string;
  invoice_amount: string | number;
  advance_payment: string | number;
  balance_due: string | number;
  currency: string;
  etd: string;
  eta: string;
  remarks: string;
  status: string;
}

// New interface for InventoryForm's initialData
export interface InventoryFormData {
  date: string;
  reference?: string;
  poNo: string;
  vendor?: string; // Assuming vendor is string ID here
  items: {
    id: string; // For formik internal use, not necessarily part of API payload
    productId: string;
    itemCode: string;
    unit?: string;
    stock: number;
  }[];
}


export interface Account {
  _id?: string;
  name: string;
  code: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense' | 'Bank' | 'Cash';
  openingBalance: number;
  status: 'active' | 'inactive';
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AccountFilter {
  search?: string;
  status?: string;
  type?: string;
}

export interface Expense {
  _id?: string;
  date: string;
  category: string;
  amount: number;
  taxAmount?: number;
  totalAmount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Credit Card' | 'Other';
  referenceNo?: string;
  description?: string;
  companyName?: string;
  vendorId?: string | Vendor;
  status: 'pending' | 'paid' | 'cancelled';
  attachments?: string[];
  createdAt?: string;
}

export interface ExpenseFilter {
  search?: string;
  category?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  companyName?: string;
}

export interface InvoiceItem {
  productId?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxPercentage?: number;
  taxAmount?: number;
  total: number;
}

export interface Invoice {
  _id?: string;
  invoiceNo: string;
  customerId: string | Customer;
  date: string;
  dueDate?: string;
  status: 'Draft' | 'Sent' | 'Paid' | 'Partially Paid' | 'Overdue' | 'Cancelled';
  items: InvoiceItem[];
  subTotal: number;
  taxTotal?: number;
  discountTotal?: number;
  totalAmount: number;
  paidAmount?: number;
  balanceAmount?: number;
  notes?: string;
  terms?: string;
  createdAt?: string;
}

export interface InvoiceFilter {
  search?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface Payment {
  _id?: string;
  date: string;
  type: 'Received' | 'Paid';
  amount: number;
  paymentMethod: 'Cash' | 'Bank Transfer' | 'Cheque' | 'Credit Card' | 'Other';
  referenceId?: string; // Link to Invoice or Expense
  referenceType?: 'Invoice' | 'Expense' | 'General';
  transactionId?: string;
  remarks?: string;
  companyName?: string;
  status: 'completed' | 'pending' | 'failed';
  createdAt?: string;
}

export interface PaymentFilter {
  search?: string;
  type?: 'Received' | 'Paid';
  startDate?: string;
  endDate?: string;
  companyName?: string;
}

export interface LedgerEntry {
  _id?: string;
  date: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
  referenceId?: string;
  referenceType?: string;
  companyName?: string;
  createdBy: string | User;
}

export interface LedgerFilter {
  search?: string;
  startDate?: string;
  endDate?: string;
  companyName?: string;
}
