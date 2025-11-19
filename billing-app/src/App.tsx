import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { BillingPage } from './pages/BillingPage'
import { ItemsPage } from './pages/ItemsPage'
import { CustomersPage } from './pages/CustomersPage'
import { ReportsPage } from './pages/ReportsPage'
import { FinancialYearPage } from './pages/FinancialYearPage'
import { useBillingStore } from './state/useBillingStore'

type TabKey = 'billing' | 'items' | 'customers' | 'reports' | 'financial'

const tabs: { key: TabKey; label: string }[] = [
  { key: 'billing', label: 'Billing' },
  { key: 'items', label: 'Items' },
  { key: 'customers', label: 'Customers' },
  { key: 'reports', label: 'Reports' },
  { key: 'financial', label: 'Financial Years' }
]

const App = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('billing')
  const { initialized, loading } = useBillingStore(state => ({
    initialized: state.initialized,
    loading: state.loading
  }))
  const loadApp = useBillingStore(state => state.actions.loadApp)

  useEffect(() => {
    if (!initialized && !loading) {
      void loadApp()
    }
  }, [initialized, loading, loadApp])

  const content = useMemo(() => {
    switch (activeTab) {
      case 'billing':
        return <BillingPage />
      case 'items':
        return <ItemsPage />
      case 'customers':
        return <CustomersPage />
      case 'reports':
        return <ReportsPage />
      case 'financial':
        return <FinancialYearPage />
      default:
        return null
    }
  }, [activeTab])

  if (!initialized) {
    return (
      <div className="loading-screen">
        <div className="loader" />
        <p>Preparing your billing workspace…</p>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <h1>Grocery Billing</h1>
          <p>Desktop POS &amp; Reports</p>
        </div>
        <nav>
          <ul>
            {tabs.map(tab => (
              <li key={tab.key}>
                <button
                  className={tab.key === activeTab ? 'active' : undefined}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="main-content">{content}</main>
    </div>
  )
}

export default App
