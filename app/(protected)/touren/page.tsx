'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ── Typen ──────────────────────────────────────────────────────────────────
interface Tour {
  id: number
  tour_date: string
  order_no: string
  container_no: string | null
  vehicle_id: number
  customer_id: number
  loading_place_id: number | null
  loading_place_text: string | null
  departure_type: string
  weight_kg: number | null
  last_km: number
  appointment_time: string | null
  arrival_time: string | null
  departure_time: string | null
  adr_required: boolean
  fd_required: boolean
  multistop_required: boolean
  multistop_reason: string | null
  expected_freight: number
  expected_diesel_surcharge: number
  expected_toll: number
  expected_waiting_fee: number
  expected_adr_fee: number
  expected_fd_fee: number
  expected_multistop_fee: number
  expected_total: number
  credit_status: string
  tour_status: string
  warning_text: string | null
  notes: string | null
}

interface Vehicle { id: number; plate: string }
interface Customer { id: number; name: string }
interface LoadingPlace { id: number; name: string }

const DEPARTURE_TYPES = ['Hafen', 'Kunde', 'Lager', 'Sonstige']
const CREDIT_STATUSES = ['offen', 'geprüft', 'abgerechnet', 'storniert']
const TOUR_STATUSES = ['geplant', 'aktiv', 'abgeschlossen', 'storniert']

const EMPTY_FORM: Omit<Tour, 'id'> = {
  tour_date: new Date().toISOString().slice(0, 10),
  order_no: '',
  container_no: '',
  vehicle_id: 0,
  customer_id: 0,
  loading_place_id: null,
  loading_place_text: '',
  departure_type: 'Hafen',
  weight_kg: null,
  last_km: 0,
  appointment_time: null,
  arrival_time: null,
  departure_time: null,
  adr_required: false,
  fd_required: false,
  multistop_required: false,
  multistop_reason: '',
  expected_freight: 0,
  expected_diesel_surcharge: 0,
  expected_toll: 0,
  expected_waiting_fee: 0,
  expected_adr_fee: 0,
  expected_fd_fee: 0,
  expected_multistop_fee: 0,
  expected_total: 0,
  credit_status: 'offen',
  tour_status: 'geplant',
  warning_text: '',
  notes: '',
}

// ── Hilfsfunktionen ────────────────────────────────────────────────────────
function toLocalDatetimeInput(iso: string | null): string {
  if (!iso) return ''
  return iso.slice(0, 16)
}

function fromLocalDatetimeInput(val: string): string | null {
  if (!val) return null
  return new Date(val).toISOString()
}

function sumTotal(f: Omit<Tour, 'id'>): number {
  return (
    Number(f.expected_freight) +
    Number(f.expected_diesel_surcharge) +
    Number(f.expected_toll) +
    Number(f.expected_waiting_fee) +
    Number(f.expected_adr_fee) +
    Number(f.expected_fd_fee) +
    Number(f.expected_multistop_fee)
  )
}

// ── Haupt-Komponente ───────────────────────────────────────────────────────
export default function TourenPage() {
  const supabase = createClient()

  const [tours, setTours] = useState<Tour[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loadingPlaces, setLoadingPlaces] = useState<LoadingPlace[]>([])

  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState<Omit<Tour, 'id'>>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7))

  // Stammdaten laden
  useEffect(() => {
    supabase.from('vehicles').select('id,plate').order('plate').then(({ data }) => setVehicles(data ?? []))
    supabase.from('customers').select('id,name').order('name').then(({ data }) => setCustomers(data ?? []))
    supabase.from('loading_places').select('id,name').order('name').then(({ data }) => setLoadingPlaces(data ?? []))
  }, [])

  // Touren laden
  useEffect(() => { loadTours() }, [filterMonth])

  async function loadTours() {
    const from = filterMonth + '-01'
    const to = filterMonth + '-31'
    const { data } = await supabase
      .from('tours')
      .select('*')
      .gte('tour_date', from)
      .lte('tour_date', to)
      .order('tour_date', { ascending: false })
    setTours(data ?? [])
  }

  function openNew() {
    setEditId(null)
    setForm({ ...EMPTY_FORM, vehicle_id: vehicles[0]?.id ?? 0, customer_id: customers[0]?.id ?? 0 })
    setError(null)
    setShowForm(true)
  }

  function openEdit(t: Tour) {
    setEditId(t.id)
    setForm({
      tour_date: t.tour_date,
      order_no: t.order_no,
      container_no: t.container_no ?? '',
      vehicle_id: t.vehicle_id,
      customer_id: t.customer_id,
      loading_place_id: t.loading_place_id,
      loading_place_text: t.loading_place_text ?? '',
      departure_type: t.departure_type,
      weight_kg: t.weight_kg,
      last_km: t.last_km,
      appointment_time: t.appointment_time,
      arrival_time: t.arrival_time,
      departure_time: t.departure_time,
      adr_required: t.adr_required,
      fd_required: t.fd_required,
      multistop_required: t.multistop_required,
      multistop_reason: t.multistop_reason ?? '',
      expected_freight: t.expected_freight,
      expected_diesel_surcharge: t.expected_diesel_surcharge,
      expected_toll: t.expected_toll,
      expected_waiting_fee: t.expected_waiting_fee,
      expected_adr_fee: t.expected_adr_fee,
      expected_fd_fee: t.expected_fd_fee,
      expected_multistop_fee: t.expected_multistop_fee,
      expected_total: t.expected_total,
      credit_status: t.credit_status,
      tour_status: t.tour_status,
      warning_text: t.warning_text ?? '',
      notes: t.notes ?? '',
    })
    setError(null)
    setShowForm(true)
  }

  function set(field: keyof Omit<Tour, 'id'>, value: unknown) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      next.expected_total = sumTotal(next)
      return next
    })
  }

  async function save() {
    if (!form.order_no) { setError('Auftragsnummer ist Pflichtfeld.'); return }
    if (!form.vehicle_id) { setError('Bitte ein Fahrzeug auswählen.'); return }
    if (!form.customer_id) { setError('Bitte einen Kunden auswählen.'); return }
    setSaving(true)
    setError(null)

    const payload = {
      ...form,
      container_no: form.container_no || null,
      loading_place_text: form.loading_place_text || null,
      multistop_reason: form.multistop_reason || null,
      warning_text: form.warning_text || null,
      notes: form.notes || null,
      appointment_time: fromLocalDatetimeInput(form.appointment_time),
      arrival_time: fromLocalDatetimeInput(form.arrival_time),
      departure_time: fromLocalDatetimeInput(form.departure_time),
      expected_total: sumTotal(form),
    }

    const { error: dbError } = editId
      ? await supabase.from('tours').update(payload).eq('id', editId)
      : await supabase.from('tours').insert(payload)

    setSaving(false)
    if (dbError) { setError(dbError.message); return }
    setShowForm(false)
    loadTours()
  }

  async function deleteTour(id: number) {
    if (!confirm('Tour wirklich löschen?')) return
    await supabase.from('tours').delete().eq('id', id)
    loadTours()
  }

  const vehicleName = (id: number) => vehicles.find(v => v.id === id)?.plate ?? id
  const customerName = (id: number) => customers.find(c => c.id === id)?.name ?? id

  const statusColor: Record<string, string> = {
    geplant: 'bg-blue-100 text-blue-700',
    aktiv: 'bg-yellow-100 text-yellow-700',
    abgeschlossen: 'bg-green-100 text-green-700',
    storniert: 'bg-red-100 text-red-700',
  }

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-slate-800">Touren</h1>
          <p className="text-sm text-slate-500">Erfassung und Übersicht aller Touren</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="month"
            value={filterMonth}
            onChange={e => setFilterMonth(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm"
          />
          <button
            onClick={openNew}
            className="rounded-md bg-primary-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-800"
          >
            + Neue Tour
          </button>
        </div>
      </div>

      {/* Tabelle */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Datum</th>
              <th className="px-4 py-3">Auftrag</th>
              <th className="px-4 py-3">Kunde</th>
              <th className="px-4 py-3">Fahrzeug</th>
              <th className="px-4 py-3">Abfahrt</th>
              <th className="px-4 py-3 text-right">Erwarteter Umsatz</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Abrechnung</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tours.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                  Keine Touren für diesen Monat gefunden.
                </td>
              </tr>
            )}
            {tours.map(t => (
              <tr key={t.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700">{t.tour_date}</td>
                <td className="px-4 py-3 font-medium text-slate-800">{t.order_no}</td>
                <td className="px-4 py-3 text-slate-600">{customerName(t.customer_id)}</td>
                <td className="px-4 py-3 text-slate-600">{vehicleName(t.vehicle_id)}</td>
                <td className="px-4 py-3 text-slate-600">{t.departure_type}</td>
                <td className="px-4 py-3 text-right font-medium text-slate-800">
                  {Number(t.expected_total).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColor[t.tour_status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {t.tour_status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${t.credit_status === 'abgerechnet' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                    {t.credit_status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(t)} className="text-xs text-primary-700 hover:underline">Bearbeiten</button>
                    <button onClick={() => deleteTour(t.id)} className="text-xs text-red-500 hover:underline">Löschen</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 py-8">
          <div className="w-full max-w-3xl rounded-xl bg-white shadow-xl">
            {/* Modal-Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="font-semibold text-slate-800">{editId ? 'Tour bearbeiten' : 'Neue Tour erfassen'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-6 px-6 py-5">
              {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

              {/* Abschnitt: Basisdaten */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Basisdaten</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Datum *">
                    <input type="date" value={form.tour_date} onChange={e => set('tour_date', e.target.value)} className={input} />
                  </Field>
                  <Field label="Auftragsnummer *">
                    <input type="text" value={form.order_no} onChange={e => set('order_no', e.target.value)} className={input} placeholder="z. B. AU-2024-001" />
                  </Field>
                  <Field label="Container-Nr.">
                    <input type="text" value={form.container_no ?? ''} onChange={e => set('container_no', e.target.value)} className={input} />
                  </Field>
                  <Field label="Abfahrtsart *">
                    <select value={form.departure_type} onChange={e => set('departure_type', e.target.value)} className={input}>
                      {DEPARTURE_TYPES.map(d => <option key={d}>{d}</option>)}
                    </select>
                  </Field>
                  <Field label="Fahrzeug *">
                    <select value={form.vehicle_id} onChange={e => set('vehicle_id', Number(e.target.value))} className={input}>
                      <option value={0}>– bitte wählen –</option>
                      {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate}</option>)}
                    </select>
                  </Field>
                  <Field label="Kunde *">
                    <select value={form.customer_id} onChange={e => set('customer_id', Number(e.target.value))} className={input}>
                      <option value={0}>– bitte wählen –</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Ladeort (Dropdown)">
                    <select value={form.loading_place_id ?? ''} onChange={e => set('loading_place_id', e.target.value ? Number(e.target.value) : null)} className={input}>
                      <option value="">– kein –</option>
                      {loadingPlaces.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Ladeort (Freitext)">
                    <input type="text" value={form.loading_place_text ?? ''} onChange={e => set('loading_place_text', e.target.value)} className={input} placeholder="Manueller Ladeort" />
                  </Field>
                  <Field label="Gewicht (kg)">
                    <input type="number" value={form.weight_kg ?? ''} onChange={e => set('weight_kg', e.target.value ? Number(e.target.value) : null)} className={input} />
                  </Field>
                  <Field label="Kilometer *">
                    <input type="number" value={form.last_km} onChange={e => set('last_km', Number(e.target.value))} className={input} />
                  </Field>
                </div>
              </section>

              {/* Abschnitt: Zeiten */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Zeiten</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Termindatum/-zeit">
                    <input type="datetime-local" value={toLocalDatetimeInput(form.appointment_time)} onChange={e => set('appointment_time', e.target.value)} className={input} />
                  </Field>
                  <Field label="Ankunftszeit">
                    <input type="datetime-local" value={toLocalDatetimeInput(form.arrival_time)} onChange={e => set('arrival_time', e.target.value)} className={input} />
                  </Field>
                  <Field label="Abfahrtszeit">
                    <input type="datetime-local" value={toLocalDatetimeInput(form.departure_time)} onChange={e => set('departure_time', e.target.value)} className={input} />
                  </Field>
                </div>
              </section>

              {/* Abschnitt: Sonderleistungen */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Sonderleistungen</h3>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={form.adr_required} onChange={e => set('adr_required', e.target.checked)} className="h-4 w-4 rounded" />
                    ADR erforderlich
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={form.fd_required} onChange={e => set('fd_required', e.target.checked)} className="h-4 w-4 rounded" />
                    Fernfahrer erforderlich
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input type="checkbox" checked={form.multistop_required} onChange={e => set('multistop_required', e.target.checked)} className="h-4 w-4 rounded" />
                    Multistop
                  </label>
                </div>
                {form.multistop_required && (
                  <div className="mt-3">
                    <Field label="Multistop-Grund">
                      <input type="text" value={form.multistop_reason ?? ''} onChange={e => set('multistop_reason', e.target.value)} className={input} />
                    </Field>
                  </div>
                )}
              </section>

              {/* Abschnitt: Erwartete Erlöse */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Erwartete Erlöse (€)</h3>
                <div className="grid grid-cols-3 gap-4">
                  <Field label="Fracht">
                    <input type="number" step="0.01" value={form.expected_freight} onChange={e => set('expected_freight', Number(e.target.value))} className={input} />
                  </Field>
                  <Field label="Dieselzuschlag">
                    <input type="number" step="0.01" value={form.expected_diesel_surcharge} onChange={e => set('expected_diesel_surcharge', Number(e.target.value))} className={input} />
                  </Field>
                  <Field label="Maut">
                    <input type="number" step="0.01" value={form.expected_toll} onChange={e => set('expected_toll', Number(e.target.value))} className={input} />
                  </Field>
                  <Field label="Wartegebühr">
                    <input type="number" step="0.01" value={form.expected_waiting_fee} onChange={e => set('expected_waiting_fee', Number(e.target.value))} className={input} />
                  </Field>
                  <Field label="ADR-Zuschlag">
                    <input type="number" step="0.01" value={form.expected_adr_fee} onChange={e => set('expected_adr_fee', Number(e.target.value))} className={input} />
                  </Field>
                  <Field label="FD-Zuschlag">
                    <input type="number" step="0.01" value={form.expected_fd_fee} onChange={e => set('expected_fd_fee', Number(e.target.value))} className={input} />
                  </Field>
                  <Field label="Multistop-Zuschlag">
                    <input type="number" step="0.01" value={form.expected_multistop_fee} onChange={e => set('expected_multistop_fee', Number(e.target.value))} className={input} />
                  </Field>
                </div>
                <div className="mt-3 rounded-md bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800">
                  Gesamt: {sumTotal(form).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                </div>
              </section>

              {/* Abschnitt: Status & Notizen */}
              <section>
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Status & Notizen</h3>
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Tourstatus">
                    <select value={form.tour_status} onChange={e => set('tour_status', e.target.value)} className={input}>
                      {TOUR_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Abrechnungsstatus">
                    <select value={form.credit_status} onChange={e => set('credit_status', e.target.value)} className={input}>
                      {CREDIT_STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </Field>
                  <Field label="Warnhinweis">
                    <input type="text" value={form.warning_text ?? ''} onChange={e => set('warning_text', e.target.value)} className={input} />
                  </Field>
                  <Field label="Notizen">
                    <input type="text" value={form.notes ?? ''} onChange={e => set('notes', e.target.value)} className={input} />
                  </Field>
                </div>
              </section>
            </div>

            {/* Modal-Footer */}
            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button onClick={() => setShowForm(false)} className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50">
                Abbrechen
              </button>
              <button onClick={save} disabled={saving} className="rounded-md bg-primary-700 px-4 py-2 text-sm font-medium text-white hover:bg-primary-800 disabled:opacity-50">
                {saving ? 'Speichern…' : 'Speichern'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Hilfskomponente: Formularfeld ──────────────────────────────────────────
const input = 'w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-slate-600">{label}</label>
      {children}
    </div>
  )
}
