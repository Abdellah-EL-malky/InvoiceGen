import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getStats, getInvoices } from '../services/api'
import { FileText, Users, TrendingUp, CheckCircle, Plus, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const statusColors = {
  DRAFT: 'bg-slate-700 text-slate-300',
  SENT: 'bg-blue-500/20 text-blue-400',
  PAID: 'bg-emerald-500/20 text-emerald-400',
}

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentInvoices, setRecentInvoices] = useState([])

  useEffect(() => {
    getStats().then(r => setStats(r.data))
    getInvoices().then(r => setRecentInvoices(r.data.slice(0, 5)))
  }, [])

  const cards = [
    { label: 'Total Invoices', value: stats?.totalInvoices ?? '—', icon: FileText, color: 'text-blue-400', bg: 'bg-blue-500/10' },
    { label: 'Paid', value: stats?.paidCount ?? '—', icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Pending', value: stats ? stats.draftCount + stats.sentCount : '—', icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { label: 'Total Revenue', value: stats ? `€${stats.totalRevenue?.toFixed(2)}` : '—', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">
            Good morning, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here's what's happening with your invoices</p>
        </div>
        <Link
          to="/invoices/new"
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Invoice
        </Link>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className={`w-9 h-9 ${bg} rounded-lg flex items-center justify-center mb-4`}>
              <Icon size={18} className={color} />
            </div>
            <p className="text-2xl font-semibold text-white font-mono">{value}</p>
            <p className="text-xs text-slate-400 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Recent invoices */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h2 className="font-semibold text-white text-sm">Recent Invoices</h2>
          <Link to="/invoices" className="text-emerald-400 hover:text-emerald-300 text-xs flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>

        {recentInvoices.length === 0 ? (
          <div className="py-16 text-center">
            <FileText size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">No invoices yet</p>
            <Link to="/invoices/new" className="text-emerald-400 hover:text-emerald-300 text-sm mt-2 inline-block">
              Create your first invoice →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {recentInvoices.map((inv) => (
              <Link
                key={inv.id}
                to={`/invoices/${inv.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-800/50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-white font-mono">{inv.invoiceNumber}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{inv.client?.name}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[inv.status]}`}>
                    {inv.status}
                  </span>
                  <span className="text-sm font-semibold text-white font-mono">
                    €{inv.total?.toFixed(2)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
