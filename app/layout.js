import './globals.css'
import { Inter } from 'next/font/google'
import 'mapbox-gl/dist/mapbox-gl.css';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Agar',
  description: 'Rent Units in Amman ',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
