import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Royal Logistik | Controlling',
  description: 'Interne Verwaltungsanwendung für Touren-, Tank- und Mautdaten',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  )
}
