import React, { useState, useEffect, useRef } from 'react';
import { motion, PanInfo, useMotionValue, animate } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Series } from '../types';
import { getProxiedImageUrl } from '../utils/imageUtils';

interface FeaturedSliderProps {
  seriesList: Series[];
}

export const FeaturedSlider: React.FC<FeaturedSliderProps> = ({ seriesList }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef<(() => void) | null>(null);
  const centerCardRef = useRef<HTMLDivElement | null>(null);
  const wasDraggedRef = useRef(false);
  const x = useMotionValue(0);

  const limitedSeries = React.useMemo(() => (seriesList || []).slice(0, 5), [seriesList]);
  const length = limitedSeries.length;

  useEffect(() => {
    if (currentIndex >= length && length > 0) {
      setCurrentIndex(0);
    }
  }, [currentIndex, length]);

  const getStepPx = () => {
    const cardWidth = centerCardRef.current?.offsetWidth || 250;
    const gap = 16; // gap-4
    return cardWidth + gap;
  };

  const slideBy = (delta: number) => {
    if (length <= 1) return;
    const stepPx = getStepPx();
    const currentX = x.get();
    setCurrentIndex((prev) => ((prev + delta) % length + length) % length);
    x.set(currentX + delta * stepPx);
    animate(x, 0, { type: 'spring', stiffness: 300, damping: 32 });
  };

  const nextSlide = () => slideBy(1);
  const prevSlide = () => slideBy(-1);

  useEffect(() => {
    // Move right automatically every 3 seconds
    autoPlayRef.current = prevSlide;
  });

  useEffect(() => {
    if (isHovered || length <= 1) return;
    const interval = setInterval(() => {
      if (autoPlayRef.current) autoPlayRef.current();
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered, length]);

  if (length === 0) return null;

  const handleDragStart = () => {
    wasDraggedRef.current = true;
  };

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 45;
    if (info.offset.x < -swipeThreshold && length > 1) {
      nextSlide();
    } else if (info.offset.x > swipeThreshold && length > 1) {
      prevSlide();
    } else {
      animate(x, 0, { type: 'spring', stiffness: 320, damping: 30 });
    }
    setTimeout(() => {
      wasDraggedRef.current = false;
    }, 100);
  };

  const offsets = length === 1 ? [0] : [-3, -2, -1, 0, 1, 2, 3];

  const getSeriesAtOffset = (offset: number) => {
    const idx = ((currentIndex + offset) % length + length) % length;
    return limitedSeries[idx];
  };

  return (
    <div
      dir="ltr"
      className="relative w-full overflow-hidden select-none py-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Centered Peek Carousel Track */}
      <motion.div
        style={{ x }}
        drag={length > 1 ? 'x' : false}
        dragConstraints={{ left: -260, right: 260 }}
        dragElastic={0.25}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className="flex items-center justify-center gap-4 cursor-grab active:cursor-grabbing"
      >
        {offsets.map((offset) => {
          const item = getSeriesAtOffset(offset);
          const isCenter = offset === 0;
          const imgUrl = getProxiedImageUrl(item.coverImage || item.backgroundImage || '');

          return (
            <div
              key={offset}
              ref={isCenter ? centerCardRef : undefined}
              className="w-[62vw] max-w-[260px] sm:w-[260px] md:w-[290px] lg:w-[310px] aspect-[2/3] shrink-0"
            >
              {isCenter ? (
                <Link
                  to={`/series/${item.slug}`}
                  onClick={(e) => {
                    if (wasDraggedRef.current) e.preventDefault();
                  }}
                  draggable={false}
                  className="block w-full h-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-[0_14px_36px_rgba(0,0,0,0.65)] group"
                >
                  <img
                    src={imgUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    referrerPolicy="no-referrer"
                    draggable={false}
                  />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (!wasDraggedRef.current) slideBy(offset);
                  }}
                  aria-label={item.title}
                  className="block w-full h-full rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-[0_10px_28px_rgba(0,0,0,0.5)] opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <img
                    src={imgUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    draggable={false}
                  />
                </button>
              )}
            </div>
          );
        })}
      </motion.div>

      {/* Circular Left / Right Navigation Buttons */}
      {length > 1 && (
        <>
          <button
            type="button"
            onClick={prevSlide}
            aria-label="السابق"
            className="absolute left-3 sm:left-6 md:left-10 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-900/85 hover:bg-zinc-800 backdrop-blur-md text-white border border-white/15 shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={nextSlide}
            aria-label="التالي"
            className="absolute right-3 sm:right-6 md:right-10 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-900/85 hover:bg-zinc-800 backdrop-blur-md text-white border border-white/15 shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

