import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getInvoices, deleteInvoice, updateInvoiceStatus, downloadPdf } from '../services/api'
import { Plus, FileText, Download, Trash2, Eye, MoreVertical } from 'lucide-react'
import { format } from 'date-fns'

const statusColors = {
  DRAFT: 'bg-slate-700 text-slate-300',
  SENT: 'bg-blue-500/20 text-blue-400',
  PAID: 'bg-emerald-500/20 text-emerald-400',
}

const statusNext = { DRAFT: 'SENT', SENT: 'PAID' }

export default function Invoices() {
  const [invoices, setInvoices] = useState([])
  const [filter, setFilter] = useState('ALL')
  const [openMenu, setOpenMenu] = useState(null)

  const load = () => getInvoices().then(r => setInvoices(r.data))
  useEffect(() => { load() }, [])

  const handleDelete = async (id) => {
    if (!confirm('Delete invoice?')) return
    await deleteInvoice(id)
    load()
  }

  const handleStatusChange = async (id, status) => {
    await updateInvoiceStatus(id, status)
    setOpenMenu(null)
    load()
  }

  const handleDownload = async (inv) => {
    const { data } = await downloadPdf(inv.id)
    const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${inv.invoiceNumber}.pdf`
    a.click()
  }

  const filtered = filter === 'ALL' ? invoices : invoices.filter(i => i.status === filter)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-white">Invoices</h1>
          <p className="text-slate-400 text-sm mt-1">{invoices.length} total</p>
        </div>
        <Link to="/invoices/new" className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors">
          <Plus size={16} /> New Invoice
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['ALL', 'DRAFT', 'SENT', 'PAID'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl py-20 text-center">
          <FileText size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400">No invoices found</p>
          <Link to="/invoices/new" className="text-emerald-400 hover:text-emerald-300 text-sm mt-2 inline-block">
            Create invoice →
          </Link>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 px-6 py-3 border-b border-slate-800 text-xs font-medium text-slate-500 uppercase tracking-wide">
            <div className="col-span-3">Invoice</div>
            <div className="col-span-3">Client</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1 text-right">Total</div>
            <div className="col-span-1"></div>
          </div>

          {filtered.map((inv) => (
            <div key={inv.id} className="grid grid-cols-12 items-center px-6 py-4 border-b border-slate-800 last:border-0 hover:bg-slate-800/30 transition-colors">
              <div className="col-span-3">
                <Link to={`/invoices/${inv.id}`} className="font-mono text-sm text-white hover:text-emerald-400 transition-colors">
                  {inv.invoiceNumber}
                </Link>
              </div>
              <div className="col-span-3">
                <p className="text-sm text-slate-300">{inv.client?.name}</p>
                {inv.client?.company && <p className="text-xs text-slate-500">{inv.client?.company}</p>}
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-400">
                  {inv.issueDate ? format(new Date(inv.issueDate), 'dd MMM yyyy') : '—'}
                </p>
              </div>
              <div className="col-span-2">
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[inv.status]}`}>
                  {inv.status}
                </span>
              </div>
              <div className="col-span-1 text-right">
                <span className="font-mono text-sm text-white font-semibold">€{inv.total?.toFixed(2)}</span>
              </div>
              <div className="col-span-1 flex justify-end items-center gap-1 relative">
                <button onClick={() => handleDownload(inv)} className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors" title="Download PDF">
                  <Download size={13} />
                </button>
                <button onClick={() => setOpenMenu(openMenu === inv.id ? null : inv.id)} className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-700 rounded-lg transition-colors">
                  <MoreVertical size={13} />
                </button>
                {openMenu === inv.id && (
                  <div className="absolute right-0 top-8 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-10 py-1 min-w-[160px]">
                    <Link to={`/invoices/${inv.id}`} className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors" onClick={() => setOpenMenu(null)}>
                      <Eye size={12} /> View
                    </Link>
                    {statusNext[inv.status] && (
                      <button onClick={() => handleStatusChange(inv.id, statusNext[inv.status])} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors">
                        Mark as {statusNext[inv.status]}
                      </button>
                    )}
                    <button onClick={() => { setOpenMenu(null); handleDelete(inv.id) }} className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={12} /> Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
