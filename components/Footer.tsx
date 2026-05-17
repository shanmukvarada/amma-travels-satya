import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-primary text-white pt-16 pb-8 border-t-4 border-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <span className="font-heading font-bold text-3xl tracking-tight text-white mb-4 block">Amma Travels</span>
            <p className="text-gray-400 max-w-sm mb-6 leading-relaxed">
              Premium self-drive vehicle rentals in Kakinada. Choose from a wide range of well-maintained cars and bikes for your next journey.
            </p>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4 text-white relative inline-block after:content-[''] after:block after:w-1/2 after:h-0.5 after:bg-accent after:mt-1">Quick Links</h4>
            <ul className="space-y-3">
              <li><Link href="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/vehicles" className="text-gray-400 hover:text-white transition-colors">Our Vehicles</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-heading font-semibold text-lg mb-4 text-white relative inline-block after:content-[''] after:block after:w-1/2 after:h-0.5 after:bg-accent after:mt-1">Contact Us</h4>
            <ul className="space-y-3">
              <li className="text-gray-400">Kakinada, Andhra Pradesh, India</li>
              <li><a href="tel:9652520222" className="text-gray-400 hover:text-white transition-colors font-medium">+91 96525 20222</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Amma Travels. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
