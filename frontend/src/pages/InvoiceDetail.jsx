import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getInvoice, updateInvoiceStatus, deleteInvoice, downloadPdf } from '../services/api'
import { ArrowLeft, Download, Pencil, Trash2, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'

const statusColors = {
  DRAFT: 'bg-slate-700 text-slate-300 border-slate-600',
  SENT: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  PAID: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
}
const statusFlow = ['DRAFT', 'SENT', 'PAID']

export default function InvoiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [invoice, setInvoice] = useState(null)

  const load = () => getInvoice(id).then(r => setInvoice(r.data))
  useEffect(() => { load() }, [id])

  if (!invoice) return (
    <div className="p-8 text-slate-400 text-sm">Loading...</div>
  )

  const currentStatusIdx = statusFlow.indexOf(invoice.status)
  const nextStatus = statusFlow[currentStatusIdx + 1]

  const handleStatusChange = async (status) => {
    await updateInvoiceStatus(id, status)
    load()
  }

  const handleDelete = async () => {
    if (!confirm('Delete this invoice?')) return
    await deleteInvoice(id)
    navigate('/invoices')
  }

  const handleDownload = async () => {
    const { data } = await downloadPdf(id)
    const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${invoice.invoiceNumber}.pdf`
    a.click()
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-mono font-semibold text-white">{invoice.invoiceNumber}</h1>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${statusColors[invoice.status]}`}>
                {invoice.status}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">
              Created {invoice.createdAt ? format(new Date(invoice.createdAt), 'dd MMM yyyy') : '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {nextStatus && (
            <button onClick={() => handleStatusChange(nextStatus)} className="flex items-center gap-1.5 text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
              Mark as {nextStatus} <ChevronRight size={12} />
            </button>
          )}
          <button onClick={handleDownload} className="flex items-center gap-2 text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
            <Download size={13} /> PDF
          </button>
          <Link to={`/invoices/${id}/edit`} className="flex items-center gap-2 text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors">
            <Pencil size={13} /> Edit
          </Link>
          <button onClick={handleDelete} className="flex items-center gap-2 text-xs px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors">
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Invoice card */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {/* Header section */}
        <div className="bg-slate-950 px-8 py-6 border-b border-slate-800">
          <div className="flex justify-between">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">From</p>
              <p className="text-sm font-semibold text-white">Your Business</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">To</p>
              <p className="text-sm font-semibold text-white">{invoice.client?.name}</p>
              {invoice.client?.company && <p className="text-xs text-slate-400">{invoice.client?.company}</p>}
              {invoice.client?.email && <p className="text-xs text-slate-400">{invoice.client?.email}</p>}
              {invoice.client?.address && <p className="text-xs text-slate-400">{invoice.client?.address}</p>}
            </div>
          </div>

          <div className="flex gap-8 mt-6">
            {[
              { label: 'Issue Date', value: invoice.issueDate ? format(new Date(invoice.issueDate), 'dd MMM yyyy') : '—' },
              { label: 'Due Date', value: invoice.dueDate ? format(new Date(invoice.dueDate), 'dd MMM yyyy') : '—' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm text-white">{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="px-8 py-6">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-wide border-b border-slate-800">
                <th className="text-left pb-3">Description</th>
                <th className="text-right pb-3">Qty</th>
                <th className="text-right pb-3">Unit Price</th>
                <th className="text-right pb-3">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {invoice.items?.map((item, i) => (
                <tr key={i}>
                  <td className="py-3 text-sm text-slate-300">{item.description}</td>
                  <td className="py-3 text-sm text-slate-300 text-right font-mono">{item.quantity}</td>
                  <td className="py-3 text-sm text-slate-300 text-right font-mono">€{item.unitPrice?.toFixed(2)}</td>
                  <td className="py-3 text-sm text-white text-right font-mono font-medium">€{item.total?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="px-8 py-4 bg-slate-950 border-t border-slate-800">
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex justify-between w-52 text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white font-mono">€{invoice.subtotal?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-52 text-sm">
              <span className="text-slate-400">Tax ({invoice.taxRate}%)</span>
              <span className="text-white font-mono">€{invoice.taxAmount?.toFixed(2)}</span>
            </div>
            <div className="w-52 h-px bg-slate-700 my-1" />
            <div className="flex justify-between w-52">
              <span className="text-white font-semibold">Total</span>
              <span className="text-emerald-400 font-mono font-bold text-xl">€{invoice.total?.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {invoice.notes && (
          <div className="px-8 py-4 border-t border-slate-800">
            <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Notes</p>
            <p className="text-sm text-slate-300">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
