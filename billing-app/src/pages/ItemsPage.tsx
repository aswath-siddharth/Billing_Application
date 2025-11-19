import { FormEvent, useMemo, useState } from 'react'
import type { Item, UUID } from '../types/models'
import { useBillingStore } from '../state/useBillingStore'

type ItemFormState = {
  englishName: string
  tamilName: string
  unitPrice: string
  unit: string
  gstRate: string
  hsnCode: string
  barcode: string
  notes: string
}

const initialState: ItemFormState = {
  englishName: '',
  tamilName: '',
  unitPrice: '',
  unit: 'Nos',
  gstRate: '0',
  hsnCode: '',
  barcode: '',
  notes: ''
}

const parseNumber = (value: string) => {
  const parsed = parseFloat(value)
  return Number.isNaN(parsed) ? 0 : parsed
}

const formatCurrency = (value: number) => value.toLocaleString('en-IN', {
  style: 'currency',
  currency: 'INR'
})

export const ItemsPage = () => {
  const { items } = useBillingStore(state => ({ items: state.items }))
  const { addItem, updateItem, deleteItem } = useBillingStore(state => state.actions)
  const [form, setForm] = useState<ItemFormState>(initialState)
  const [editingId, setEditingId] = useState<UUID | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => a.englishName.localeCompare(b.englishName)),
    [items]
  )

  const resetForm = () => {
    setForm(initialState)
    setEditingId(null)
    setError(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!form.englishName.trim() || !form.tamilName.trim()) {
      setError('Both English and Tamil item names are required.')
      return
    }
    if (!form.unitPrice.trim()) {
      setError('Please enter a unit price.')
      return
    }

    const unitPrice = parseNumber(form.unitPrice)
    const gstRate = parseNumber(form.gstRate)

    if (unitPrice <= 0) {
      setError('Unit price must be greater than zero.')
      return
    }

    if (gstRate < 0) {
      setError('GST rate cannot be negative.')
      return
    }

    const payload = {
      englishName: form.englishName.trim(),
      tamilName: form.tamilName.trim(),
      unitPrice,
      unit: form.unit.trim() || 'Nos',
      gstRate,
      hsnCode: form.hsnCode.trim() || undefined,
      barcode: form.barcode.trim() || undefined,
      notes: form.notes.trim() || undefined
    }

    try {
      if (editingId) {
        await updateItem(editingId, payload)
      } else {
        await addItem(payload)
      }
      resetForm()
    } catch (err) {
      console.error(err)
      setError('Unable to save the item. Please try again.')
    }
  }

  const handleEdit = (item: Item) => {
    setEditingId(item.id)
    setForm({
      englishName: item.englishName,
      tamilName: item.tamilName,
      unitPrice: item.unitPrice.toString(),
      unit: item.unit,
      gstRate: item.gstRate.toString(),
      hsnCode: item.hsnCode ?? '',
      barcode: item.barcode ?? '',
      notes: item.notes ?? ''
    })
  }

  const handleDelete = async (id: UUID) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return
    await deleteItem(id)
    if (editingId === id) {
      resetForm()
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Items</h1>
          <p>Maintain your inventory with English entry and Tamil billing names.</p>
        </div>
        {editingId && (
          <button className="button ghost" onClick={resetForm} type="button">
            Cancel edit
          </button>
        )}
      </header>

      <div className="card">
        <form className="form-grid" onSubmit={handleSubmit}>
          <div className="field">
            <label>English Name *</label>
            <input
              value={form.englishName}
              onChange={event => setForm(prev => ({ ...prev, englishName: event.target.value }))}
              placeholder="Enter item name in English"
              required
            />
          </div>
          <div className="field">
            <label>Tamil Name *</label>
            <input
              value={form.tamilName}
              onChange={event => setForm(prev => ({ ...prev, tamilName: event.target.value }))}
              placeholder="Enter item name in Tamil"
              required
            />
          </div>
          <div className="field">
            <label>Unit Price (₹) *</label>
            <input
              type="number"
              step="0.01"
              value={form.unitPrice}
              onChange={event => setForm(prev => ({ ...prev, unitPrice: event.target.value }))}
              placeholder="0.00"
              required
            />
          </div>
          <div className="field">
            <label>Unit</label>
            <input
              value={form.unit}
              onChange={event => setForm(prev => ({ ...prev, unit: event.target.value }))}
              placeholder="Nos / Kg / L"
            />
          </div>
          <div className="field">
            <label>GST %</label>
            <input
              type="number"
              step="0.01"
              value={form.gstRate}
              onChange={event => setForm(prev => ({ ...prev, gstRate: event.target.value }))}
              placeholder="0"
            />
          </div>
          <div className="field">
            <label>HSN Code</label>
            <input
              value={form.hsnCode}
              onChange={event => setForm(prev => ({ ...prev, hsnCode: event.target.value }))}
              placeholder="Optional"
            />
          </div>
          <div className="field">
            <label>Barcode</label>
            <input
              value={form.barcode}
              onChange={event => setForm(prev => ({ ...prev, barcode: event.target.value }))}
              placeholder="Optional"
            />
          </div>
          <div className="field span-2">
            <label>Notes</label>
            <textarea
              value={form.notes}
              onChange={event => setForm(prev => ({ ...prev, notes: event.target.value }))}
              placeholder="Any special notes"
              rows={2}
            />
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="form-actions">
            <button className="button primary" type="submit">
              {editingId ? 'Update Item' : 'Add Item'}
            </button>
          </div>
        </form>
      </div>

      <div className="card">
        <header className="card-header">
          <h2>Catalog</h2>
          <span>{sortedItems.length} items</span>
        </header>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>English Name</th>
                <th>Tamil Name</th>
                <th className="numeric">Unit Price</th>
                <th className="numeric">GST %</th>
                <th>Unit</th>
                <th>HSN</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty">
                    No items yet. Add your first product using the form above.
                  </td>
                </tr>
              )}
              {sortedItems.map(item => (
                <tr key={item.id}>
                  <td>{item.englishName}</td>
                  <td>{item.tamilName}</td>
                  <td className="numeric">{formatCurrency(item.unitPrice)}</td>
                  <td className="numeric">{item.gstRate.toFixed(2)}</td>
                  <td>{item.unit}</td>
                  <td>{item.hsnCode ?? '-'}</td>
                  <td className="actions">
                    <button className="link" onClick={() => handleEdit(item)} type="button">
                      Edit
                    </button>
                    <button className="link danger" onClick={() => handleDelete(item.id)} type="button">
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

