import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Amma Travels',
  description: 'Vehicle Rental Platform',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
        <main className="flex-grow flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
