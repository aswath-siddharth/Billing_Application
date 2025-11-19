import { create } from 'zustand'
import { db } from '../db/billing-db'
import type {
  Bill,
  BillLineItem,
  Customer,
  FinancialYear,
  GstReportEntry,
  Item,
  SalesReportEntry,
  UUID
} from '../types/models'
import { createId } from '../utils/id'
import { aggregateBillTotals, calculateLineTotal } from '../utils/tax'
import { parseISO } from 'date-fns'
import { formatFinancialYearName, isoNow, toMonthKey } from '../utils/dates'

type ItemPayload = Omit<Item, 'id' | 'createdAt' | 'updatedAt'>
type CustomerPayload = Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>

type BillItemInput = {
  item: Item
  quantity: number
}

type BillPayload = {
  customerId?: UUID
  customerName?: string
  customerTamilName?: string
  customerPhone?: string
  customerGstNumber?: string
  paymentMode: Bill['paymentMode']
  notes?: string
  items: BillItemInput[]
  billDate?: string
}

type BillingState = {
  initialized: boolean
  loading: boolean
  items: Item[]
  customers: Customer[]
  financialYears: FinancialYear[]
  activeFinancialYear: FinancialYear | null
  bills: Bill[]
  actions: {
    loadApp: () => Promise<void>
    addItem: (input: ItemPayload) => Promise<Item>
    updateItem: (id: UUID, input: Partial<ItemPayload>) => Promise<Item | undefined>
    deleteItem: (id: UUID) => Promise<void>
    addCustomer: (input: CustomerPayload) => Promise<Customer>
    updateCustomer: (id: UUID, input: Partial<CustomerPayload>) => Promise<Customer | undefined>
    deleteCustomer: (id: UUID) => Promise<void>
    createFinancialYear: (startDate: string, endDate: string) => Promise<FinancialYear>
    setActiveFinancialYear: (id: UUID) => Promise<void>
    createBill: (payload: BillPayload) => Promise<Bill>
    getGstReport: (financialYearId: UUID) => Promise<GstReportEntry[]>
    getSalesReport: (financialYearId: UUID) => Promise<SalesReportEntry[]>
  }
}

const ensureFinancialYear = async (): Promise<FinancialYear> => {
  const existing = await db.financialYears.filter(fy => fy.isActive).first()
  if (existing) {
    return existing
  }

  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() >= 3 ? 3 : -9, 1)
  const end = new Date(start)
  end.setFullYear(start.getFullYear() + 1)
  end.setDate(end.getDate() - 1)

  const financialYear: FinancialYear = {
    id: createId(),
    name: formatFinancialYearName(start),
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    isActive: true,
    nextInvoiceNumber: 1,
    createdAt: isoNow(),
    updatedAt: isoNow()
  }

  await db.financialYears.add(financialYear)
  return financialYear
}

const mapBillItems = (inputs: BillItemInput[]): BillLineItem[] => {
  return inputs.map(({ item, quantity }) => {
    const totals = calculateLineTotal(item.unitPrice, quantity, item.gstRate)
    return {
      id: createId(),
      itemId: item.id,
      englishName: item.englishName,
      tamilName: item.tamilName,
      quantity,
      unitPrice: item.unitPrice,
      gstRate: item.gstRate,
      ...totals
    }
  })
}

export const useBillingStore = create<BillingState>()((set, get) => ({
  initialized: false,
  loading: false,
  items: [],
  customers: [],
  financialYears: [],
  activeFinancialYear: null,
  bills: [],
  actions: {
    loadApp: async () => {
      set({ loading: true })
      const financialYear = await ensureFinancialYear()
      const [items, customers, billsRaw, financialYears] = await Promise.all([
        db.items.toArray(),
        db.customers.toArray(),
        db.bills.where('financialYearId').equals(financialYear.id).toArray(),
        db.financialYears.toArray()
      ])

      const bills = billsRaw.sort((a, b) => b.billDate.localeCompare(a.billDate))

      set({
        items,
        customers,
        bills,
        financialYears,
        activeFinancialYear: financialYear,
        loading: false,
        initialized: true
      })
    },
    addItem: async input => {
      const timestamp = isoNow()
      const item: Item = {
        id: createId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        ...input
      }
      await db.items.add(item)
      set(state => ({ items: [...state.items, item] }))
      return item
    },
    updateItem: async (id, input) => {
      const existing = await db.items.get(id)
      if (!existing) return undefined
      const updated: Item = {
        ...existing,
        ...input,
        updatedAt: isoNow()
      }
      await db.items.put(updated)
      set(state => ({
        items: state.items.map(item => (item.id === id ? updated : item))
      }))
      return updated
    },
    deleteItem: async id => {
      await db.items.delete(id)
      set(state => ({ items: state.items.filter(item => item.id !== id) }))
    },
    addCustomer: async input => {
      const timestamp = isoNow()
      const customer: Customer = {
        id: createId(),
        createdAt: timestamp,
        updatedAt: timestamp,
        ...input
      }
      await db.customers.add(customer)
      set(state => ({ customers: [...state.customers, customer] }))
      return customer
    },
    updateCustomer: async (id, input) => {
      const existing = await db.customers.get(id)
      if (!existing) return undefined
      const updated: Customer = {
        ...existing,
        ...input,
        updatedAt: isoNow()
      }
      await db.customers.put(updated)
      set(state => ({
        customers: state.customers.map(customer =>
          customer.id === id ? updated : customer
        )
      }))
      return updated
    },
    deleteCustomer: async id => {
      await db.customers.delete(id)
      set(state => ({
        customers: state.customers.filter(customer => customer.id !== id)
      }))
    },
    createFinancialYear: async (startDate, endDate) => {
      const timestamp = isoNow()
      const start = parseISO(startDate)
      const year: FinancialYear = {
        id: createId(),
        name: formatFinancialYearName(start),
        startDate,
        endDate,
        isActive: false,
        nextInvoiceNumber: 1,
        createdAt: timestamp,
        updatedAt: timestamp
      }
      await db.financialYears.add(year)
      set(state => ({ financialYears: [...state.financialYears, year] }))
      return year
    },
    setActiveFinancialYear: async id => {
      const { financialYears } = get()
      const currentActive = financialYears.find(fy => fy.isActive)
      if (currentActive?.id === id) return
      const timestamp = isoNow()
      await db.transaction('rw', db.financialYears, async () => {
        if (currentActive) {
          await db.financialYears.put({
            ...currentActive,
            isActive: false,
            updatedAt: timestamp
          })
        }
        const next = await db.financialYears.get(id)
        if (!next) throw new Error('Financial year not found')
        const updated = { ...next, isActive: true, updatedAt: timestamp }
        await db.financialYears.put(updated)
        const billsRaw = await db.bills
          .where('financialYearId')
          .equals(updated.id)
          .toArray()
        const bills = billsRaw.sort((a, b) => b.billDate.localeCompare(a.billDate))
        set({
          financialYears: financialYears.map(fy =>
            fy.id === updated.id
              ? updated
              : fy.id === currentActive?.id
              ? { ...fy, isActive: false, updatedAt: timestamp }
              : fy
          ),
          activeFinancialYear: updated,
          bills
        })
      })
    },
    createBill: async payload => {
      const state = get()
      const financialYear = state.activeFinancialYear
      if (!financialYear) {
        throw new Error('No active financial year')
      }

      const timestamp = isoNow()
      const billDate = payload.billDate ?? timestamp
      const monthKey = toMonthKey(billDate)
      const lineItems = mapBillItems(payload.items)
      const totals = aggregateBillTotals(lineItems)
      const invoiceNumber = `${financialYear.name.replace('-', '')}/${financialYear.nextInvoiceNumber.toString().padStart(4, '0')}`

      const bill: Bill = {
        id: createId(),
        invoiceNumber,
        financialYearId: financialYear.id,
        billDate,
        customerId: payload.customerId,
        customerName: payload.customerName,
        customerTamilName: payload.customerTamilName,
        customerPhone: payload.customerPhone,
        customerGstNumber: payload.customerGstNumber,
        paymentMode: payload.paymentMode,
        notes: payload.notes,
        lineItems,
        totals,
        monthKey,
        createdAt: timestamp,
        updatedAt: timestamp
      }

      await db.transaction('rw', db.bills, db.financialYears, async () => {
        await db.bills.add(bill)
        await db.financialYears.put({
          ...financialYear,
          nextInvoiceNumber: financialYear.nextInvoiceNumber + 1,
          updatedAt: timestamp
        })
      })

      set(state => ({
        bills: [bill, ...state.bills],
        financialYears: state.financialYears.map(fy =>
          fy.id === financialYear.id
            ? { ...fy, nextInvoiceNumber: fy.nextInvoiceNumber + 1, updatedAt: timestamp }
            : fy
        ),
        activeFinancialYear: {
          ...financialYear,
          nextInvoiceNumber: financialYear.nextInvoiceNumber + 1,
          updatedAt: timestamp
        }
      }))

      return bill
    },
    getGstReport: async financialYearId => {
      const bills = await db.bills
        .where('financialYearId')
        .equals(financialYearId)
        .toArray()

      const map = new Map<string, GstReportEntry>()
      bills.forEach(bill => {
        const isB2B = Boolean(bill.customerGstNumber && bill.customerGstNumber.trim().length > 0)
        const existing = map.get(bill.monthKey)
        const base: GstReportEntry = existing ?? {
          monthKey: bill.monthKey,
          b2bInvoices: 0,
          b2bTaxableValue: 0,
          b2bCgst: 0,
          b2bSgst: 0,
          b2cInvoices: 0,
          b2cTaxableValue: 0,
          b2cCgst: 0,
          b2cSgst: 0,
          totalTaxableValue: 0,
          totalCgst: 0,
          totalSgst: 0,
          total: 0
        }

        if (isB2B) {
          base.b2bInvoices += 1
          base.b2bTaxableValue += bill.totals.taxableValue
          base.b2bCgst += bill.totals.cgst
          base.b2bSgst += bill.totals.sgst
        } else {
          base.b2cInvoices += 1
          base.b2cTaxableValue += bill.totals.taxableValue
          base.b2cCgst += bill.totals.cgst
          base.b2cSgst += bill.totals.sgst
        }

        base.totalTaxableValue += bill.totals.taxableValue
        base.totalCgst += bill.totals.cgst
        base.totalSgst += bill.totals.sgst
        base.total += bill.totals.total

        map.set(bill.monthKey, base)
      })

      return Array.from(map.values())
        .map(entry => ({
          ...entry,
          b2bTaxableValue: +entry.b2bTaxableValue.toFixed(2),
          b2bCgst: +entry.b2bCgst.toFixed(2),
          b2bSgst: +entry.b2bSgst.toFixed(2),
          b2cTaxableValue: +entry.b2cTaxableValue.toFixed(2),
          b2cCgst: +entry.b2cCgst.toFixed(2),
          b2cSgst: +entry.b2cSgst.toFixed(2),
          totalTaxableValue: +entry.totalTaxableValue.toFixed(2),
          totalCgst: +entry.totalCgst.toFixed(2),
          totalSgst: +entry.totalSgst.toFixed(2),
          total: +entry.total.toFixed(2)
        }))
        .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    },
    getSalesReport: async financialYearId => {
      const bills = await db.bills
        .where('financialYearId')
        .equals(financialYearId)
        .toArray()

      const map = new Map<string, { totalSales: number; invoices: number }>()
      bills.forEach(bill => {
        const entry = map.get(bill.monthKey)
        if (entry) {
          entry.totalSales += bill.totals.total
          entry.invoices += 1
        } else {
          map.set(bill.monthKey, {
            totalSales: bill.totals.total,
            invoices: 1
          })
        }
      })

      return Array.from(map.entries())
        .map(([monthKey, data]) => ({
          monthKey,
          totalSales: +data.totalSales.toFixed(2),
          totalInvoices: data.invoices,
          averageInvoiceValue: +(data.totalSales / data.invoices).toFixed(2)
        }))
        .sort((a, b) => a.monthKey.localeCompare(b.monthKey))
    }
  }
}))

