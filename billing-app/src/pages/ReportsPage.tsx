import { useEffect, useState } from 'react'
import { useBillingStore } from '../state/useBillingStore'
import type { GstReportEntry, SalesReportEntry } from '../types/models'
import { parse, format } from 'date-fns'

const toReadableMonth = (monthKey: string) => {
  const date = parse(monthKey, 'yyyy-MM', new Date())
  return format(date, 'MMM yyyy')
}

export const ReportsPage = () => {
  const { activeFinancialYear } = useBillingStore(state => ({
    activeFinancialYear: state.activeFinancialYear
  }))
  const { getGstReport, getSalesReport } = useBillingStore(state => state.actions)
  const [gstReport, setGstReport] = useState<GstReportEntry[]>([])
  const [salesReport, setSalesReport] = useState<SalesReportEntry[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const loadReports = async () => {
      if (!activeFinancialYear) return
      setLoading(true)
      const [gst, sales] = await Promise.all([
        getGstReport(activeFinancialYear.id),
        getSalesReport(activeFinancialYear.id)
      ])
      setGstReport(gst)
      setSalesReport(sales)
      setLoading(false)
    }

    void loadReports()
  }, [activeFinancialYear, getGstReport, getSalesReport])

  if (!activeFinancialYear) {
    return (
      <div className="page">
        <header className="page-header">
          <h1>Reports</h1>
        </header>
        <p>Select or create a financial year to see reports.</p>
      </div>
    )
  }

  return (
    <div className="page">
      <header className="page-header">
        <div>
          <h1>Reports</h1>
          <p>Monthly GST and sales summary for {activeFinancialYear.name}.</p>
        </div>
      </header>

      {loading && <p>Loading reports…</p>}

      <div className="grid-2">
        <div className="card">
          <header className="card-header">
            <h2>GST Report</h2>
            <span>Includes SGST and CGST</span>
          </header>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th className="numeric">Taxable Value (₹)</th>
                  <th className="numeric">CGST (₹)</th>
                  <th className="numeric">SGST (₹)</th>
                  <th className="numeric">Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {gstReport.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty">
                      No invoices recorded yet.
                    </td>
                  </tr>
                )}
                {gstReport.map(row => (
                  <tr key={row.monthKey}>
                    <td>{toReadableMonth(row.monthKey)}</td>
                    <td className="numeric">{row.totalTaxableValue.toFixed(2)}</td>
                    <td className="numeric">{row.totalCgst.toFixed(2)}</td>
                    <td className="numeric">{row.totalSgst.toFixed(2)}</td>
                    <td className="numeric">{row.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <header className="card-header">
            <h2>Sales Report</h2>
            <span>Monthly sales overview</span>
          </header>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Month</th>
                  <th className="numeric">Invoices</th>
                  <th className="numeric">Total Sales (₹)</th>
                  <th className="numeric">Avg. Invoice (₹)</th>
                </tr>
              </thead>
              <tbody>
                {salesReport.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty">
                      No invoices recorded yet.
                    </td>
                  </tr>
                )}
                {salesReport.map(row => (
                  <tr key={row.monthKey}>
                    <td>{toReadableMonth(row.monthKey)}</td>
                    <td className="numeric">{row.totalInvoices}</td>
                    <td className="numeric">{row.totalSales.toFixed(2)}</td>
                    <td className="numeric">{row.averageInvoiceValue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

