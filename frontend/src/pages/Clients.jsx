import { useState, useEffect } from 'react'
import { getClients, createClient, updateClient, deleteClient } from '../services/api'
import { Plus, Pencil, Trash2, Users, X, Check } from 'lucide-react'

const empty = { name: '', email: '', phone: '', address: '', company: '' }

export default function Clients() {
  const [clients, setClients] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [loading, setLoading] = useState(false)

  const load = () => getClients().then(r => setClients(r.data))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm(empty); setShowModal(true) }
  const openEdit = (c) => { setEditing(c); setForm({ name: c.name, email: c.email || '', phone: c.phone || '', address: c.address || '', company: c.company || '' }); setShowModal(true) }

  const save = async () => {
    setLoading(true)
    try {
      if (editing) await updateClient(editing.id, form)
      else await createClient(form)
      await load()
      setShowModal(false)
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this client?')) return
    await deleteClient(id)
    await load()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Clients</h1>
          <p className="text-slate-400 text-sm mt-1">{clients.length} client{clients.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors">
          <Plus size={16} /> New Client
        </button>
      </div>

      {clients.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl py-20 text-center">
          <Users size={40} className="text-slate-700 mx-auto mb-4" />
          <p className="text-slate-400">No clients yet</p>
          <button onClick={openCreate} className="text-emerald-400 hover:text-emerald-300 text-sm mt-2">
            Add your first client →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {clients.map((c) => (
            <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="w-9 h-9 bg-emerald-500/10 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-emerald-400 font-semibold text-sm">{c.name[0].toUpperCase()}</span>
                  </div>
                  <p className="font-semibold text-white text-sm">{c.name}</p>
                  {c.company && <p className="text-xs text-slate-400 mt-0.5">{c.company}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(c)} className="p-1.5 text-slate-500 hover:text-slate-300 hover:bg-slate-800 rounded-lg transition-colors">
                    <Pencil size={13} />
                  </button>
                  <button onClick={() => remove(c.id)} className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-lg transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              {c.email && <p className="text-xs text-slate-400">{c.email}</p>}
              {c.phone && <p className="text-xs text-slate-500 mt-0.5">{c.phone}</p>}
              {c.address && <p className="text-xs text-slate-500 mt-0.5 truncate">{c.address}</p>}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-semibold text-white">{editing ? 'Edit Client' : 'New Client'}</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300">
                <X size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { field: 'name', label: 'Name *', placeholder: 'John Doe' },
                { field: 'company', label: 'Company', placeholder: 'Acme Inc.' },
                { field: 'email', label: 'Email', placeholder: 'john@example.com' },
                { field: 'phone', label: 'Phone', placeholder: '+33 6 00 00 00 00' },
                { field: 'address', label: 'Address', placeholder: '123 Main St, Paris' },
              ].map(({ field, label, placeholder }) => (
                <div key={field}>
                  <label className="text-xs text-slate-400 block mb-1">{label}</label>
                  <input
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    placeholder={placeholder}
                    className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500 transition-colors"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium py-2.5 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={save} disabled={loading || !form.name} className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-900 text-sm font-semibold py-2.5 rounded-lg transition-colors">
                <Check size={15} />
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
