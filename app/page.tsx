import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Car, Shield, Clock, MapPin } from 'lucide-react';
import * as motion from 'motion/react-client';

export default function HomePage() {
  return (
    <div className="w-full">
      <section className="relative overflow-hidden bg-primary pt-24 pb-32">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0A2540] via-[#061727] to-black opacity-90"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="w-full lg:w-1/2 flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-white text-xs uppercase tracking-widest font-semibold mb-6"
            >
              <MapPin className="w-3 h-3 mr-2 text-accent" /> Kakinada&apos;s #1 Choice
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="font-heading text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] tracking-tight mb-6"
            >
              Drive Your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-hover">Own Story.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg text-gray-300 max-w-xl mb-10 font-light leading-relaxed"
            >
              Premium self-drive cars and bikes in Kakinada. Transparent pricing, pristine condition vehicles, and a seamless booking experience.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto"
            >
              <Link href="/vehicles" className="px-8 py-4 rounded-full bg-accent text-white font-semibold text-lg flex items-center justify-center hover:bg-accent-hover transition-all shadow-[0_0_30px_rgba(255,78,0,0.3)] hover:shadow-[0_0_40px_rgba(255,78,0,0.5)]">
                Explore Vehicles
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </motion.div>
          </div>

          <motion.div 
             initial={{ opacity: 0, scale: 0.95 }}
             animate={{ opacity: 1, scale: 1 }}
             transition={{ duration: 0.8, delay: 0.2 }}
             className="w-full lg:w-1/2 relative"
          >
            <div className="relative w-full aspect-[4/3] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 bg-gray-900">
              <Image 
                src="https://picsum.photos/seed/luxurycars/1200/900" 
                alt="Luxury Vehicle Rental" 
                fill
                className="object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-transparent to-transparent"></div>
              
              <div className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center border-4 border-white/10">
                  <span className="font-bold text-white tracking-tighter">5.0</span>
                </div>
                <div>
                  <div className="text-white font-bold font-heading">Highest Rated</div>
                  <div className="text-white/70 text-xs uppercase tracking-widest">In Kakinada</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-heading text-4xl lg:text-5xl font-bold text-primary mb-6">Why Amma Travels?</h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">We provide the most reliable and premium self-drive experience.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { icon: Car, title: 'Premium Fleet', desc: 'Well-maintained, clean, and latest model cars and bikes.' },
              { icon: Shield, title: 'Fully Insured', desc: 'Drive with peace of mind. All our vehicles are comprehensively insured.' },
              { icon: Clock, title: '24/7 Support', desc: 'Round-the-clock roadside assistance and customer support.' }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-surface rounded-3xl p-10 border border-gray-100 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300"
              >
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-8 text-primary border border-gray-100">
                  <feature.icon className="w-8 h-8 text-accent" />
                </div>
                <h3 className="text-2xl font-bold font-heading mb-4 text-primary">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      <a 
        href="https://wa.me/919652520222" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 w-16 h-16 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform z-50"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.876 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>
      </a>
    </div>
  );
}
