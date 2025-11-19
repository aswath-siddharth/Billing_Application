import type { Bill } from '../types/models'
import { format } from 'date-fns'

const currency = (value: number) =>
  value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })

type BillPrintProps = {
  bill: Bill
  shopName?: string
  shopAddress?: string
  shopGstin?: string
}

export const BillPrint = ({
  bill,
  shopName = 'Grocery Billing System',
  shopAddress = 'Your shop address goes here',
  shopGstin
}: BillPrintProps) => {
  const billDate = format(new Date(bill.billDate), 'dd-MM-yyyy')

  return (
    <div className="print-area">
      <header className="print-header">
        <h1>{shopName}</h1>
        <p>{shopAddress}</p>
        {shopGstin && <p>GSTIN: {shopGstin}</p>}
        <div className="print-meta">
          <span>
            <strong>Invoice:</strong> {bill.invoiceNumber}
          </span>
          <span>
            <strong>Date:</strong> {billDate}
          </span>
        </div>
      </header>

      <section className="print-customer">
        <h2>வாடிக்கையாளர் விவரங்கள்</h2>
        <p>
          <strong>பெயர்:</strong> {bill.customerTamilName ?? bill.customerName ?? 'வாடிக்கையாளர்'}
        </p>
        {bill.customerPhone && (
          <p>
            <strong>தொலைபேசி:</strong> {bill.customerPhone}
          </p>
        )}
      </section>

      <table className="print-table">
        <thead>
          <tr>
            <th>பொருள்</th>
            <th>அளவு</th>
            <th>விலை</th>
            <th>SGST</th>
            <th>CGST</th>
            <th>மொத்தம்</th>
          </tr>
        </thead>
        <tbody>
          {bill.lineItems.map(item => (
            <tr key={item.id}>
              <td>
                <div className="print-item-name">
                  <span className="tamil">{item.tamilName}</span>
                  <span className="english">{item.englishName}</span>
                </div>
              </td>
              <td>{item.quantity}</td>
              <td>{currency(item.taxableAmount)}</td>
              <td>{currency(item.sgstAmount)}</td>
              <td>{currency(item.cgstAmount)}</td>
              <td>{currency(item.totalAmount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="print-summary">
        <div>
          <p>
            <strong>வரிவிலக்கு மொத்தம்:</strong> ₹{currency(bill.totals.taxableValue)}
          </p>
          <p>
            <strong>SGST:</strong> ₹{currency(bill.totals.sgst)}
          </p>
          <p>
            <strong>CGST:</strong> ₹{currency(bill.totals.cgst)}
          </p>
        </div>
        <div className="print-total">
          <h2>
            Grand Total: ₹{currency(bill.totals.total)}
          </h2>
        </div>
      </section>

      {bill.notes && (
        <section className="print-notes">
          <h3>குறிப்பு</h3>
          <p>{bill.notes}</p>
        </section>
      )}

      <footer className="print-footer">
        <p>நன்றி! மறு வருகை புரியுங்கள்.</p>
      </footer>
    </div>
  )
}

