import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getClients, createInvoice, updateInvoice, getInvoice } from '../services/api'
import { Plus, Trash2, ArrowLeft, Save } from 'lucide-react'

const emptyItem = { description: '', quantity: 1, unitPrice: 0 }

export default function InvoiceForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEdit = !!id

  const [clients, setClients] = useState([])
  const [form, setForm] = useState({
    clientId: '',
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    taxRate: 20,
    notes: '',
    items: [{ ...emptyItem }],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getClients().then(r => setClients(r.data))
    if (isEdit) {
      getInvoice(id).then(r => {
        const inv = r.data
        setForm({
          clientId: inv.client?.id || '',
          issueDate: inv.issueDate || '',
          dueDate: inv.dueDate || '',
          taxRate: inv.taxRate || 0,
          notes: inv.notes || '',
          items: inv.items?.length ? inv.items.map(i => ({
            description: i.description,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })) : [{ ...emptyItem }],
        })
      })
    }
  }, [id])

  const updateItem = (idx, field, value) => {
    const items = [...form.items]
    items[idx] = { ...items[idx], [field]: value }
    setForm({ ...form, items })
  }

  const addItem = () => setForm({ ...form, items: [...form.items, { ...emptyItem }] })
  const removeItem = (idx) => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })

  const subtotal = form.items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0), 0)
  const tax = subtotal * (parseFloat(form.taxRate) || 0) / 100
  const total = subtotal + tax

  const save = async () => {
    if (!form.clientId) return setError('Please select a client')
    if (form.items.every(i => !i.description)) return setError('Add at least one item')
    setLoading(true)
    setError('')
    try {
      const payload = { ...form, clientId: parseInt(form.clientId), taxRate: parseFloat(form.taxRate) || 0 }
      if (isEdit) await updateInvoice(id, payload)
      else await createInvoice(payload)
      navigate('/invoices')
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to save invoice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => navigate(-1)} className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-2xl font-semibold text-white">{isEdit ? 'Edit Invoice' : 'New Invoice'}</h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-lg mb-6">{error}</div>
      )}

      <div className="space-y-6">
        {/* Client & Dates */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Invoice Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-slate-400 block mb-1.5">Client *</label>
              <select
                value={form.clientId}
                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500 transition-colors"
              >
                <option value="">Select a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}{c.company ? ` — ${c.company}` : ''}</option>)}
              </select>
            </div>
            {[
              { field: 'issueDate', label: 'Issue Date', type: 'date' },
              { field: 'dueDate', label: 'Due Date', type: 'date' },
              { field: 'taxRate', label: 'Tax Rate (%)', type: 'number' },
            ].map(({ field, label, type }) => (
              <div key={field}>
                <label className="text-xs text-slate-400 block mb-1.5">{label}</label>
                <input
                  type={type}
                  value={form[field]}
                  onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500 transition-colors [color-scheme:dark]"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Items */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4">Line Items</h2>

          {/* Header */}
          <div className="grid grid-cols-12 gap-2 mb-2 px-1">
            <div className="col-span-6 text-xs text-slate-500">Description</div>
            <div className="col-span-2 text-xs text-slate-500">Qty</div>
            <div className="col-span-3 text-xs text-slate-500">Unit Price</div>
            <div className="col-span-1"></div>
          </div>

          {form.items.map((item, idx) => (
            <div key={idx} className="grid grid-cols-12 gap-2 mb-2 items-center">
              <div className="col-span-6">
                <input
                  value={item.description}
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  placeholder="Service description..."
                  className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-lg px-3 py-2 focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(idx, 'quantity', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={item.unitPrice}
                  onChange={(e) => updateItem(idx, 'unitPrice', e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-2 focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="col-span-1 flex justify-center">
                {form.items.length > 1 && (
                  <button onClick={() => removeItem(idx)} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>
          ))}

          <button onClick={addItem} className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm mt-3 transition-colors">
            <Plus size={14} /> Add line item
          </button>
        </div>

        {/* Totals */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex flex-col items-end gap-2">
            <div className="flex justify-between w-48 text-sm">
              <span className="text-slate-400">Subtotal</span>
              <span className="text-white font-mono">€{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between w-48 text-sm">
              <span className="text-slate-400">Tax ({form.taxRate}%)</span>
              <span className="text-white font-mono">€{tax.toFixed(2)}</span>
            </div>
            <div className="w-48 h-px bg-slate-700 my-1" />
            <div className="flex justify-between w-48">
              <span className="text-white font-semibold">Total</span>
              <span className="text-emerald-400 font-mono font-bold text-lg">€{total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <label className="text-xs text-slate-400 block mb-1.5">Notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Payment terms, additional information..."
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500 transition-colors resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button onClick={() => navigate(-1)} className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={save} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 text-sm font-semibold rounded-lg transition-colors">
            <Save size={15} />
            {loading ? 'Saving...' : 'Save Invoice'}
          </button>
        </div>
      </div>
    </div>
  )
}
