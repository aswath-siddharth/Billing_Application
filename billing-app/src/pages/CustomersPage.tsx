import { FormEvent, useMemo, useState } from 'react'
import type { Customer, UUID } from '../types/models'
import { useBillingStore } from '../state/useBillingStore'

type CustomerFormState = {
  name: string
  tamilName: string
  phone: string
  gstNumber: string
  addressLine1: string
  addressLine2: string
  city: string
  postalCode: string
}

const emptyState: CustomerFormState = {
  name: '',
  tamilName: '',
  phone: '',
  gstNumber: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postalCode: ''
}

export const CustomersPage = () => {
  const { customers } = useBillingStore(state => ({ customers: state.customers }))
  const { addCustomer, updateCustomer, deleteCustomer } = useBillingStore(state => state.actions)
  const [form, setForm] = useState<CustomerFormState>(emptyState)
  const [editingId, setEditingId] = useState<UUID | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sortedCustomers = useMemo(
    () => [...customers].sort((a, b) => a.name.localeCompare(b.name)),
    [customers]
  )

  const reset = () => {
    setForm(emptyState)
    setEditingId(null)
    setError(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('Customer name is required.')
      return
    }

    const payload = {
      name: form.name.trim(),
      tamilName: form.tamilName.trim() || undefined,
      phone: form.phone.trim() || undefined,
      gstNumber: form.gstNumber.trim() || undefined,
      addressLine1: form.addressLine1.trim() || undefined,
      addressLine2: form.addressLine2.trim() || undefined,
      city: form.city.trim() || undefined,
      postalCode: form.postalCode.trim() || undefined
    }

    try {
      if (editingId) {
        await updateCustomer(editingId, payload)
      } else {
        await addCustomer(payload)
      }
      reset()
    } catch (err) {
      console.error(err)
      setError('Unable to save the customer. Please try again.')
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingId(customer.id)
    setForm({
      name: customer.name,
      tamilName: customer.tamilName ?? '',
      phone: customer.phone ?? '',
      gstNumber: customer.gstNumber ?? '',
      addressLine1: customer.addressLine1 ?? '',
      addressLine2: customer.addressLine2 ?? '',
      city: customer.city ?? '',
      postalCode: customer.postalCode ?? ''
    })
  }

  const handleDelete = async (id: UUID) => {
    if (!window.confirm('Delete this customer?')) return
    await deleteCustomer(id)
    if (editingId === id) {
      reset()
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Keep track of your customer contact and GST details.</p>
        </div>
        {editingId && (
          <button className="button ghost" onClick={reset} type="button">
            Cancel edit
          </button>
        )}
      </header>

      <div className="card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label>Customer Name *</label>
            <input
              value={form.name}
              onChange={event => setForm(prev => ({ ...prev, name: event.target.value }))}
              placeholder="Enter customer name"
              required
            />
          </div>
          <div className="field">
            <label>Tamil Name</label>
            <input
              value={form.tamilName}
              onChange={event => setForm(prev => ({ ...prev, tamilName: event.target.value }))}
              placeholder="Tamil name for printing"
            />
          </div>
          <div className="field">
            <label>Phone</label>
            <input
              value={form.phone}
              onChange={event => setForm(prev => ({ ...prev, phone: event.target.value }))}
              placeholder="Mobile number"
            />
          </div>
          <div className="field">
            <label>GSTIN</label>
            <input
              value={form.gstNumber}
              onChange={event => setForm(prev => ({ ...prev, gstNumber: event.target.value }))}
              placeholder="Optional"
              maxLength={15}
            />
          </div>
          <div className="field span-2">
            <label>Address Line 1</label>
            <input
              value={form.addressLine1}
              onChange={event =>
                setForm(prev => ({ ...prev, addressLine1: event.target.value }))
              }
              placeholder="Door No, Street"
            />
          </div>
          <div className="field span-2">
            <label>Address Line 2</label>
            <input
              value={form.addressLine2}
              onChange={event =>
                setForm(prev => ({ ...prev, addressLine2: event.target.value }))
              }
              placeholder="Area"
            />
          </div>
          <div className="field">
            <label>City</label>
            <input
              value={form.city}
              onChange={event => setForm(prev => ({ ...prev, city: event.target.value }))}
              placeholder="City"
            />
          </div>
          <div className="field">
            <label>Pincode</label>
            <input
              value={form.postalCode}
              onChange={event =>
                setForm(prev => ({ ...prev, postalCode: event.target.value }))
              }
              placeholder="600001"
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button className="button primary" type="submit">
              {editingId ? 'Update Customer' : 'Add Customer'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <header className="card-header">
          <h2>Customer List</h2>
          <span>{sortedCustomers.length} customers</span>
        </header>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Tamil Name</th>
                <th>Phone</th>
                <th>GSTIN</th>
                <th>City</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedCustomers.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">
                    No customers added yet.
                  </td>
                </tr>
              )}
              {sortedCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.name}</td>
                  <td>{customer.tamilName ?? '-'}</td>
                  <td>{customer.phone ?? '-'}</td>
                  <td>{customer.gstNumber ?? '-'}</td>
                  <td>{customer.city ?? '-'}</td>
                  <td className="actions">
                    <button className="link" onClick={() => handleEdit(customer)} type="button">
                      Edit
                    </button>
                    <button className="link danger" onClick={() => handleDelete(customer.id)} type="button">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

