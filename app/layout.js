import './globals.css'
import { Inter } from 'next/font/google'
import 'mapbox-gl/dist/mapbox-gl.css';
// Prime React File Upload Component CSS 
//theme
import "primereact/resources/themes/lara-light-indigo/theme.css";     
//core
import "primereact/resources/primereact.min.css";                                       
// React Toastify
import 'react-toastify/dist/ReactToastify.css';
// Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/scrollbar';

// Auth Provider Component 
import { AuthProvider } from '@/app/utils/Authenticator';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'shoqaq',
  description: 'Appartment Rentals in Amman ',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
        {children}
        </AuthProvider>
      </body>
    </html>
  )
}
