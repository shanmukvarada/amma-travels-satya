import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="bg-primary text-white p-4 flex justify-between items-center shadow-md">
       <Link href="/" className="font-bold text-xl">Amma Travels</Link>
       <div className="flex gap-4">
          <Link href="/vehicles" className="hover:text-accent transition-colors">Vehicles</Link>
          <Link href="/admin" className="hover:text-accent transition-colors">Admin</Link>
       </div>
    </nav>
  );
}
