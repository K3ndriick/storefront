import { Inter } from 'next/font/google';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/sonner';
import './globals.css';
import { AuthProvider } from '@/lib/auth/auth-context';

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'PowerProShop - Premium Gym Equipment & Repair Services',
  description: 'Shop premium gym equipment and book expert equipment servicing for all your fitness gear.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  )
}