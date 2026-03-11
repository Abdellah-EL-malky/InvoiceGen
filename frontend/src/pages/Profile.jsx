import { useState, useEffect } from 'react'
import { getProfile, updateProfile } from '../services/api'
import { Save, Check } from 'lucide-react'

const fields = [
  { key: 'name', label: 'Your Name', placeholder: 'Abdellah El Malky' },
  { key: 'businessName', label: 'Business Name', placeholder: 'EURL El Malky Dev' },
  { key: 'businessEmail', label: 'Business Email', placeholder: 'contact@monentreprise.com' },
  { key: 'businessPhone', label: 'Business Phone', placeholder: '+212 6 00 00 00 00' },
  { key: 'businessAddress', label: 'Business Address', placeholder: '12 Rue Hassan II, Safi, Maroc' },
]

export default function Profile() {
  const [form, setForm] = useState({ name: '', businessName: '', businessEmail: '', businessPhone: '', businessAddress: '' })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getProfile().then(r => setForm(r.data))
  }, [])

  const save = async () => {
    setLoading(true)
    await updateProfile(form)
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="p-8 max-w-xl">
      <h1 className="text-2xl font-semibold text-white mb-2">Profile</h1>
      <p className="text-slate-400 text-sm mb-8">This info appears on your invoices</p>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
        {fields.map(({ key, label, placeholder }) => (
          <div key={key}>
            <label className="text-xs text-slate-400 block mb-1.5">{label}</label>
            <input
              value={form[key] || ''}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              placeholder={placeholder}
              className="w-full bg-slate-800 border border-slate-700 text-white placeholder-slate-500 text-sm rounded-lg px-3 py-2.5 focus:border-emerald-500 transition-colors"
            />
          </div>
        ))}

        <button
          onClick={save}
          disabled={loading}
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all mt-2 ${
            saved
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-emerald-500 hover:bg-emerald-400 text-slate-900'
          }`}
        >
          {saved ? <><Check size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
        </button>
      </div>
    </div>
  )
}
