import { createClient } from '@/lib/supabase/server'
import TourenTable from '@/components/TourenTable'

export default async function TourenPage() {
  const supabase = createClient()

  const [
    { data: vehicles, error: vehiclesError },
    { data: customers, error: customersError },
    { data: loadingPlaces, error: loadingPlacesError },
  ] = await Promise.all([
    supabase.from('vehicles').select('id, plate').order('plate'),
    supabase.from('customers').select('id, name').order('name'),
    supabase.from('loading_places').select('id, name').order('name'),
  ])

  if (vehiclesError || customersError || loadingPlacesError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3">
        <p className="text-sm font-medium text-red-700">
          Stammdaten konnten nicht geladen werden.
        </p>
        <p className="mt-1 text-xs text-red-500">
          Bitte laden Sie die Seite neu oder wenden Sie sich an den Administrator.
        </p>
      </div>
    )
  }

  return (
    <TourenTable
      vehicles={vehicles ?? []}
      customers={customers ?? []}
      loadingPlaces={loadingPlaces ?? []}
    />
  )
}
