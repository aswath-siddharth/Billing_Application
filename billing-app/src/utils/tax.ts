import type { BillLineItem, BillTotals } from '../types/models'

export const calculateLineTotal = (
  unitPrice: number,
  quantity: number,
  gstRate: number
) => {
  const taxableAmount = unitPrice * quantity
  const halfRate = gstRate / 2
  const cgstAmount = +(taxableAmount * (halfRate / 100)).toFixed(2)
  const sgstAmount = +(taxableAmount * (halfRate / 100)).toFixed(2)
  const totalAmount = +(taxableAmount + cgstAmount + sgstAmount).toFixed(2)

  return {
    taxableAmount: +taxableAmount.toFixed(2),
    cgstAmount,
    sgstAmount,
    totalAmount
  }
}

export const aggregateBillTotals = (lineItems: BillLineItem[]): BillTotals => {
  const totals = lineItems.reduce(
    (acc, item) => {
      acc.taxableValue += item.taxableAmount
      acc.cgst += item.cgstAmount
      acc.sgst += item.sgstAmount
      acc.total += item.totalAmount
      return acc
    },
    { taxableValue: 0, cgst: 0, sgst: 0, total: 0 }
  )

  return {
    taxableValue: +totals.taxableValue.toFixed(2),
    cgst: +totals.cgst.toFixed(2),
    sgst: +totals.sgst.toFixed(2),
    total: +totals.total.toFixed(2)
  }
}

