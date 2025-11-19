import { FormEvent, useState } from 'react'
import { format, parseISO } from 'date-fns'
import { useBillingStore } from '../state/useBillingStore'

const formatDate = (value: string) => format(parseISO(value), 'dd MMM yyyy')

export const FinancialYearPage = () => {
  const { financialYears, activeFinancialYear } = useBillingStore(state => ({
    financialYears: state.financialYears,
    activeFinancialYear: state.activeFinancialYear
  }))
  const { createFinancialYear, setActiveFinancialYear } = useBillingStore(state => state.actions)
  const [startDate, setStartDate] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!startDate) {
      setError('Select a start date for the financial year.')
      return
    }

    const start = parseISO(startDate)
    const end = new Date(start)
    end.setFullYear(end.getFullYear() + 1)
    end.setDate(end.getDate() - 1)

    try {
      await createFinancialYear(start.toISOString(), end.toISOString())
      setStartDate('')
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Unable to create financial year. Please try again.')
    }
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Financial Years</h1>
          <p>Organise your invoices and reports by financial year.</p>
        </div>
      </header>

      <div className="card">
        <form className="form-inline" onSubmit={handleSubmit}>
          <div className="field">
            <label>Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={event => setStartDate(event.target.value)}
              required
            />
          </div>
          <button className="button primary" type="submit">
            Add Financial Year
          </button>
        </form>
        {error && <p className="form-error">{error}</p>}
      </div>

      <div className="card">
        <header className="card-header">
          <h2>Available Financial Years</h2>
        </header>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Start</th>
                <th>End</th>
                <th>Invoices</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {financialYears.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty">
                    No financial years created yet.
                  </td>
                </tr>
              )}
              {financialYears
                .slice()
                .sort((a, b) => b.startDate.localeCompare(a.startDate))
                .map(fy => {
                  const isActive = fy.id === activeFinancialYear?.id
                  return (
                    <tr key={fy.id} className={isActive ? 'row-active' : undefined}>
                      <td>{fy.name}</td>
                      <td>{formatDate(fy.startDate)}</td>
                      <td>{formatDate(fy.endDate)}</td>
                      <td>{fy.nextInvoiceNumber - 1}</td>
                      <td>{isActive ? 'Active' : 'Inactive'}</td>
                      <td className="actions">
                        {!isActive && (
                          <button
                            className="button small"
                            type="button"
                            onClick={() => setActiveFinancialYear(fy.id)}
                          >
                            Set Active
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

