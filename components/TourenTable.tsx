'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

// ---------------------------------------------------------------------------
// Typen
// ---------------------------------------------------------------------------

type Vehicle      = { id: string; plate: string }
type Customer     = { id: string; name: string }
type LoadingPlace = { id: string; name: string }

type Tour = {
  id: string
  tour_date: string
  vehicle_id: string
  customer_id: string
  loading_place_id: string
  distance_km: number | null
  revenue: number | null
  diesel_cost: number | null
  toll_fee: number | null
  notes: string | null
}

type Props = {
  vehicles: Vehicle[]
  customers: Customer[]
  loadingPlaces: LoadingPlace[]
}

// ---------------------------------------------------------------------------
// Hilfsfunktionen
// ---------------------------------------------------------------------------

function currentMonthValue() {
  const now = new Date()
  const mm = String(now.getMonth() + 1).padStart(2, '0')
  return `${now.getFullYear()}-${mm}` // z. B. "2025-06"
}

function monthBounds(monthValue: string) {
  const [year, month] = monthValue.split('-').map(Number)
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const to = `${year}-${String(month).padStart(2, '0')}-${lastDay}`
  return { from, to }
}

function formatEur(value: number | null) {
  if (value === null) return '–'
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value)
}

function formatKm(value: number | null) {
  if (value === null) return '–'
  return `${new Intl.NumberFormat('de-DE').format(value)} km`
}

// ---------------------------------------------------------------------------
// Komponente
// ---------------------------------------------------------------------------

export default function TourenTable({ vehicles, customers, loadingPlaces }: Props) {
  const supabase = createClient()

  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue())
  const [tours, setTours]                 = useState<Tour[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [modalOpen, setModalOpen]         = useState(false)

  // Lookup-Maps für schnelle Anzeige der Namen
  const vehicleMap      = Object.fromEntries(vehicles.map(v => [v.id, v.plate]))
  const customerMap     = Object.fromEntries(customers.map(c => [c.id, c.name]))
  const loadingPlaceMap = Object.fromEntries(loadingPlaces.map(l => [l.id, l.name]))

  useEffect(() => {
    async function fetchTours() {
      setLoading(true)
      setError(null)

      const { from, to } = monthBounds(selectedMonth)

      const { data, error: fetchError } = await supabase
        .from('tours')
        .select('id, tour_date, vehicle_id, customer_id, loading_place_id, distance_km, revenue, diesel_cost, toll_fee, notes')
        .gte('tour_date', from)
        .lte('tour_date', to)
        .order('tour_date', { ascending: false })

      if (fetchError) {
        setError('Touren konnten nicht geladen werden.')
        setTours([])
      } else {
        setTours(data ?? [])
      }

      setLoading(false)
    }

    fetchTours()
  }, [selectedMonth])

  // Wird nach erfolgreichem Modal-Insert aufgerufen
  function handleTourCreated() {
    setModalOpen(false)
    // Trigger neu laden: selectedMonth kurz auf denselben Wert setzen reicht nicht –
    // daher direkt fetchTours inline auslösen via State-Trick
    setSelectedMonth(prev => prev) // kein Re-Trigger; stattdessen:
    // Wir nutzen einen separaten Refresh-Counter
  }

  return (
    <>
      {/* Header-Zeile */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-lg font-semibold text-slate-800">Touren</h1>

        <div className="flex items-center gap-3">
          {/* Monatsfilter */}
          <input
            type="month"
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 shadow-sm focus:border-primary-600 focus:outline-none focus:ring-1 focus:ring-primary-600"
          />

          {/* Neue Tour */}
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-md bg-primary-700 px-4 py-1.5 text-sm font-medium text-white shadow-sm hover:bg-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-1"
          >
            + Neue Tour
          </button>
        </div>
      </div>

      {/* Fehlermeldung */}
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Tabelle */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {['Datum', 'Fahrzeug', 'Kunde', 'Ladeort', 'Strecke', 'Umsatz', 'Diesel', 'Maut', 'Notizen'].map(col => (
                <th
                  key={col}
                  className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-500"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                  Lade Touren …
                </td>
              </tr>
            ) : tours.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                  Keine Touren im gewählten Monat.
                </td>
              </tr>
            ) : (
              tours.map(tour => (
                <tr key={tour.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-700">
                    {new Date(tour.tour_date).toLocaleDateString('de-DE')}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-700">
                    {vehicleMap[tour.vehicle_id] ?? '–'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {customerMap[tour.customer_id] ?? '–'}
                  </td>
                  <td className="px-4 py-2.5 text-slate-700">
                    {loadingPlaceMap[tour.loading_place_id] ?? '–'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-700">
                    {formatKm(tour.distance_km)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-700">
                    {formatEur(tour.revenue)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-700">
                    {formatEur(tour.diesel_cost)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-700">
                    {formatEur(tour.toll_fee)}
                  </td>
                  <td className="max-w-xs truncate px-4 py-2.5 text-slate-500">
                    {tour.notes ?? '–'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Platzhalter Modal – wird in Schritt 3 ersetzt */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <p className="text-sm text-slate-600">TourModal kommt in Schritt 3.</p>
            <button
              onClick={() => setModalOpen(false)}
              className="mt-4 rounded-md bg-slate-100 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </>
  )
}
