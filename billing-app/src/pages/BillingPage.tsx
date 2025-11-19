import { useMemo, useState } from 'react'
import type { Bill, BillLineItem, Item, PaymentMode, UUID } from '../types/models'
import { useBillingStore } from '../state/useBillingStore'
import { calculateLineTotal, aggregateBillTotals } from '../utils/tax'
import { BillPrint } from '../components/BillPrint'

type CartLine = {
  item: Item
  quantity: number
}

const paymentModes: { value: PaymentMode; label: string }[] = [
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI' },
  { value: 'card', label: 'Card' },
  { value: 'credit', label: 'Credit' }
]

export const BillingPage = () => {
  const { items, customers, activeFinancialYear } = useBillingStore(state => ({
    items: state.items,
    customers: state.customers,
    activeFinancialYear: state.activeFinancialYear
  }))
  const { createBill } = useBillingStore(state => state.actions)

  const [search, setSearch] = useState('')
  const [cart, setCart] = useState<CartLine[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<UUID | ''>('')
  const [customerName, setCustomerName] = useState('')
  const [customerTamilName, setCustomerTamilName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerGstNumber, setCustomerGstNumber] = useState('')
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash')
  const [notes, setNotes] = useState('')
  const [billDate, setBillDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState<string | null>(null)
  const [printBill, setPrintBill] = useState<Bill | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    if (!term) return []
    return items
      .filter(item => item.englishName.toLowerCase().includes(term))
      .slice(0, 8)
  }, [items, search])

  const preparedLineItems = useMemo<BillLineItem[]>(() => {
    return cart.map(line => {
      const totals = calculateLineTotal(line.item.unitPrice, line.quantity, line.item.gstRate)
      return {
        id: line.item.id,
        itemId: line.item.id,
        englishName: line.item.englishName,
        tamilName: line.item.tamilName,
        quantity: line.quantity,
        gstRate: line.item.gstRate,
        unitPrice: line.item.unitPrice,
        ...totals
      }
    })
  }, [cart])

  const totals = useMemo(() => aggregateBillTotals(preparedLineItems), [preparedLineItems])

  const handleAddItem = (item: Item) => {
    setCart(prev => {
      const existing = prev.find(line => line.item.id === item.id)
      if (existing) {
        return prev.map(line =>
          line.item.id === item.id ? { ...line, quantity: line.quantity + 1 } : line
        )
      }
      return [...prev, { item, quantity: 1 }]
    })
    setSearch('')
  }

  const handleQuantityChange = (itemId: UUID, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(line => line.item.id !== itemId))
      return
    }
    setCart(prev =>
      prev.map(line => (line.item.id === itemId ? { ...line, quantity } : line))
    )
  }

  const handleCustomerSelect = (id: string) => {
    setSelectedCustomerId(id)
    if (!id) {
      setCustomerName('')
      setCustomerTamilName('')
      setCustomerPhone('')
      setCustomerGstNumber('')
      return
    }
    const customer = customers.find(c => c.id === id)
    if (customer) {
      setCustomerName(customer.name)
      setCustomerTamilName(customer.tamilName ?? '')
      setCustomerPhone(customer.phone ?? '')
      setCustomerGstNumber(customer.gstNumber ?? '')
    }
  }

  const resetForm = () => {
    setCart([])
    setSelectedCustomerId('')
    setCustomerName('')
    setCustomerTamilName('')
    setCustomerPhone('')
    setCustomerGstNumber('')
    setPaymentMode('cash')
    setNotes('')
    setBillDate(new Date().toISOString().slice(0, 10))
  }

  const handleCheckout = async () => {
    if (!activeFinancialYear) {
      setStatus('Please create a financial year before billing.')
      return
    }
    if (cart.length === 0) {
      setStatus('Add at least one item to the cart.')
      return
    }

    setSubmitting(true)
    setStatus(null)
    try {
      const billDateIso = new Date(`${billDate}T00:00:00`).toISOString()
      const bill = await createBill({
        customerId: selectedCustomerId || undefined,
        customerName: customerName || undefined,
        customerTamilName: customerTamilName || undefined,
        customerPhone: customerPhone || undefined,
        customerGstNumber: customerGstNumber || undefined,
        paymentMode,
        notes: notes || undefined,
        items: cart.map(line => ({ item: line.item, quantity: line.quantity })),
        billDate: billDateIso
      })

      setStatus(`Invoice ${bill.invoiceNumber} created successfully.`)
      setPrintBill(bill)
      resetForm()
    } catch (err) {
      console.error(err)
      setStatus('Unable to create bill. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePrint = async () => {
    try {
      await window.desktopApi?.printBill({ printBackground: true })
    } catch (err) {
      console.error('Print failed', err)
    }
  }

  return (
    <div className="page billing">
      <header className="page-header">
        <div>
          <h1>Billing</h1>
          <p>
            Active Financial Year:{' '}
            <strong>{activeFinancialYear ? activeFinancialYear.name : 'Not set'}</strong>
          </p>
        </div>
        <div className="bill-date">
          <label>Bill Date</label>
          <input type="date" value={billDate} onChange={event => setBillDate(event.target.value)} />
        </div>
      </header>

      <div className="card">
        <div className="search-box">
          <input
            value={search}
            onChange={event => setSearch(event.target.value)}
            placeholder="Type item name in English to add to cart"
            onKeyDown={event => {
              if (event.key === 'Enter' && filteredItems[0]) {
                event.preventDefault()
                handleAddItem(filteredItems[0])
              }
            }}
          />
          {search && filteredItems.length > 0 && (
            <ul className="search-results">
              {filteredItems.map(item => (
                <li key={item.id}>
                  <button type="button" onClick={() => handleAddItem(item)}>
                    <span className="title">{item.englishName}</span>
                    <span className="subtitle">{item.tamilName}</span>
                    <span className="meta">₹{item.unitPrice.toFixed(2)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="cart-table table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Tamil</th>
                <th className="numeric">Qty</th>
                <th className="numeric">Unit Price</th>
                <th className="numeric">Taxable</th>
                <th className="numeric">SGST</th>
                <th className="numeric">CGST</th>
                <th className="numeric">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {preparedLineItems.length === 0 && (
                <tr>
                  <td colSpan={9} className="empty">
                    Cart is empty. Search items by English name to add them.
                  </td>
                </tr>
              )}
              {preparedLineItems.map(line => (
                <tr key={line.id}>
                  <td>{line.englishName}</td>
                  <td>{line.tamilName}</td>
                  <td className="numeric">
                    <div className="qty-control">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(line.id, line.quantity - 1)}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={event => {
                          const value = Number(event.target.value)
                          if (Number.isNaN(value)) return
                          handleQuantityChange(line.id, value)
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(line.id, line.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="numeric">₹{line.unitPrice.toFixed(2)}</td>
                  <td className="numeric">₹{line.taxableAmount.toFixed(2)}</td>
                  <td className="numeric">₹{line.sgstAmount.toFixed(2)}</td>
                  <td className="numeric">₹{line.cgstAmount.toFixed(2)}</td>
                  <td className="numeric">₹{line.totalAmount.toFixed(2)}</td>
                  <td className="actions">
                    <button
                      className="link danger"
                      type="button"
                      onClick={() => handleQuantityChange(line.id, 0)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <h2>Customer Details</h2>
          <div className="field">
            <label>Select Customer</label>
            <select value={selectedCustomerId} onChange={event => handleCustomerSelect(event.target.value)}>
              <option value="">Walk-in customer</option>
              {customers.map(customer => (
                <option value={customer.id} key={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Customer Name</label>
            <input value={customerName} onChange={event => setCustomerName(event.target.value)} placeholder="Optional" />
          </div>
          <div className="field">
            <label>Tamil Name</label>
            <input
              value={customerTamilName}
              onChange={event => setCustomerTamilName(event.target.value)}
              placeholder="Printed on Tamil bill"
            />
          </div>
          <div className="field">
            <label>Phone</label>
            <input value={customerPhone} onChange={event => setCustomerPhone(event.target.value)} placeholder="Optional" />
          </div>
          <div className="field">
            <label>Payment Mode</label>
            <select value={paymentMode} onChange={event => setPaymentMode(event.target.value as PaymentMode)}>
              {paymentModes.map(mode => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Notes</label>
            <textarea value={notes} onChange={event => setNotes(event.target.value)} rows={3} />
          </div>
        </div>

        <div className="card totals">
          <h2>Summary</h2>
          <div className="summary-row">
            <span>Taxable Value</span>
            <strong>₹{totals.taxableValue.toFixed(2)}</strong>
          </div>
          <div className="summary-row">
            <span>SGST</span>
            <strong>₹{totals.sgst.toFixed(2)}</strong>
          </div>
          <div className="summary-row">
            <span>CGST</span>
            <strong>₹{totals.cgst.toFixed(2)}</strong>
          </div>
          <div className="summary-row grand">
            <span>Grand Total</span>
            <strong>₹{totals.total.toFixed(2)}</strong>
          </div>
          <button className="button primary" type="button" onClick={handleCheckout} disabled={submitting}>
            {submitting ? 'Generating Bill…' : 'Generate Bill'}
          </button>
          {status && <p className="status-message">{status}</p>}
        </div>
      </div>

      {printBill && (
        <div className="print-modal">
          <div className="print-content">
            <div className="print-actions">
              <button className="button" type="button" onClick={() => setPrintBill(null)}>
                Close
              </button>
              <button className="button primary" type="button" onClick={handlePrint}>
                Print Bill
              </button>
            </div>
            <BillPrint bill={printBill} />
          </div>
        </div>
      )}
    </div>
  )
}

