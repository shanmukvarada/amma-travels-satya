import type {Metadata} from 'next';
import './globals.css';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { AuthProvider } from '@/components/AuthProvider';
import { Toast } from '@/components/Toast';

export const metadata: Metadata = {
  title: 'Amma Travels',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow flex flex-col">
            {children}
          </main>
          <Footer />
          <Toast />
        </AuthProvider>
      </body>
    </html>
  );
}
