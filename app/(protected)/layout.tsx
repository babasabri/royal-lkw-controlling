import { createClient } from '@/lib/supabase/server'
import NavBar from '@/components/NavBar'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div className="min-h-screen">
      <NavBar userEmail={user?.email ?? ''} />
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
