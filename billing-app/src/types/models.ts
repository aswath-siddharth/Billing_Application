export type UUID = string

export interface Item {
  id: UUID
  englishName: string
  tamilName: string
  unitPrice: number
  unit: string
  gstRate: number
  hsnCode?: string
  barcode?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface Customer {
  id: UUID
  name: string
  tamilName?: string
  phone?: string
  gstNumber?: string
  addressLine1?: string
  addressLine2?: string
  city?: string
  postalCode?: string
  createdAt: string
  updatedAt: string
}

export interface BillLineItem {
  id: UUID
  itemId?: UUID
  englishName: string
  tamilName: string
  quantity: number
  unitPrice: number
  gstRate: number
  taxableAmount: number
  cgstAmount: number
  sgstAmount: number
  totalAmount: number
}

export interface BillTotals {
  taxableValue: number
  cgst: number
  sgst: number
  total: number
}

export interface Bill {
  id: UUID
  invoiceNumber: string
  financialYearId: UUID
  billDate: string
  customerId?: UUID
  customerName?: string
  customerTamilName?: string
  customerPhone?: string
  customerGstNumber?: string
  paymentMode: PaymentMode
  notes?: string
  lineItems: BillLineItem[]
  totals: BillTotals
  monthKey: string
  createdAt: string
  updatedAt: string
}

export interface FinancialYear {
  id: UUID
  name: string
  startDate: string
  endDate: string
  isActive: boolean
  nextInvoiceNumber: number
  createdAt: string
  updatedAt: string
}

export type PaymentMode = 'cash' | 'upi' | 'card' | 'credit'

export interface GstReportEntry {
  monthKey: string
  b2bInvoices: number
  b2bTaxableValue: number
  b2bCgst: number
  b2bSgst: number
  b2cInvoices: number
  b2cTaxableValue: number
  b2cCgst: number
  b2cSgst: number
  totalTaxableValue: number
  totalCgst: number
  totalSgst: number
  total: number
}

export interface SalesReportEntry {
  monthKey: string
  totalInvoices: number
  totalSales: number
  averageInvoiceValue: number
}

