import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Encontre o Versículo',
  description: 'Encontre o versículo que você está procurando',
  generator: 'juninho.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
