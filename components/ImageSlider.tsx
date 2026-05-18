'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ImageSlider({ images, alt }: { images: string[], alt: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      setCurrentIndex(state => (state === images.length - 1 ? 0 : state + 1));
    }
    if (isRightSwipe) {
      setCurrentIndex(state => (state === 0 ? images.length - 1 : state - 1));
    }
  };

  const prev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(state => (state === 0 ? images.length - 1 : state - 1));
  };

  const next = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex(state => (state === images.length - 1 ? 0 : state + 1));
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100">
        No Image
      </div>
    );
  }

  return (
    <div 
      className="relative w-full h-full overflow-hidden group"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div 
        className="w-full h-full flex transition-transform duration-500 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((img, i) => (
          <img 
            key={i} 
            src={img} 
            alt={`${alt} ${i + 1}`} 
            className="w-full h-full object-cover shrink-0"
          />
        ))}
      </div>
      
      {images.length > 1 && (
        <>
          <button 
            onClick={prev} 
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 text-gray-800 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={next} 
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white/90 text-gray-800 p-1.5 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next"
          >
            <ChevronRight size={20} />
          </button>
          
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <div 
                key={i} 
                className={`transition-all w-2.5 h-2.5 rounded-full bg-white shadow-sm ${i === currentIndex ? 'opacity-100 scale-110 relative bottom-0.5' : 'opacity-50'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
