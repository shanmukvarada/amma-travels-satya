import Link from 'next/link';
import MobileNav from '@/components/MobileNav';
import UserMenu from '@/components/UserMenu';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="bg-gray-950 sticky top-0 z-40 shadow-md">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/logo.png" alt="Amma Travels" className="h-12 w-auto object-contain" />
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium">
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
            </nav>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 md:py-8">
        {children}
      </div>

      <footer className="mt-auto py-8 bg-gray-950 pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex flex-row items-center justify-between border-b border-gray-800 pb-5 mb-5">
            <img src="/logo.png" alt="Amma Travels Logo" className="h-10 w-auto object-contain shrink-0 pr-4" />
            <div className="text-xs text-gray-400 space-y-1.5 text-right shrink-0">
              <p className="flex items-center justify-end gap-1.5">📍 Kakinada, AP</p>
              <p className="flex items-center justify-end gap-1.5">📞 <a href="tel:+919652520222" className="text-red-500 hover:text-red-400 font-bold">+91 9652520222</a></p>
            </div>
          </div>
          
          <div className="w-full flex flex-row justify-between items-center text-[10px] sm:text-xs text-gray-500 gap-2">
            <p>&copy; {new Date().getFullYear()} Amma Travels.</p>
            <Link href="/login" className="hover:text-red-500 transition-colors uppercase tracking-wider font-semibold">Admin Login</Link>
          </div>
        </div>
      </footer>
      
      <MobileNav />
    </>
  );
}
