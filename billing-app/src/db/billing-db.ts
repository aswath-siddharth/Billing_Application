import Dexie, { Table } from 'dexie'
import type { Bill, Customer, FinancialYear, Item } from '../types/models'

class BillingDatabase extends Dexie {
  items!: Table<Item, string>
  customers!: Table<Customer, string>
  bills!: Table<Bill, string>
  financialYears!: Table<FinancialYear, string>

  constructor() {
    super('grocery-billing-db')

    this.version(1).stores({
      items: '&id, englishName, tamilName, updatedAt',
      customers: '&id, phone, name, updatedAt',
      bills: '&id, invoiceNumber, billDate, monthKey, financialYearId',
      financialYears: '&id, name, startDate, endDate, isActive'
    })
  }
}

export const db = new BillingDatabase()

