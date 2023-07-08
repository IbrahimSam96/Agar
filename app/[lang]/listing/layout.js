
import { AuthProvider } from '@/app/[lang]/utils/Authenticator';

export default function RootLayout({ children, params }) {
    return (
      <html lang={params.lang}>
        <body >
          <AuthProvider>
            {children}
          </AuthProvider>
        </body>
      </html>
    )
  }
  