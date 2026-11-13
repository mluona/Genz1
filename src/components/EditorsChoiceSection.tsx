import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgeCheck, ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Series } from '../types';
import { getProxiedImageUrl } from '../utils/imageUtils';

interface EditorsChoiceSectionProps {
  seriesList: Series[];
}

export const EditorsChoiceSection: React.FC<EditorsChoiceSectionProps> = ({ seriesList }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const thumbStripRef = useRef<HTMLDivElement | null>(null);

  const items = seriesList || [];
  const length = items.length;

  useEffect(() => {
    if (activeIndex >= length && length > 0) {
      setActiveIndex(0);
    }
  }, [activeIndex, length]);

  // Auto-advance every 4.5 seconds when not paused
  useEffect(() => {
    if (isPaused || length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isPaused, length, activeIndex]);

  // Keep active thumbnail visible in strip
  useEffect(() => {
    const strip = thumbStripRef.current;
    if (!strip) return;
    const activeEl = strip.children[activeIndex] as HTMLElement | undefined;
    if (activeEl) {
      const stripRect = strip.getBoundingClientRect();
      const elRect = activeEl.getBoundingClientRect();
      const offset = elRect.left - stripRect.left - stripRect.width / 2 + elRect.width / 2;
      strip.scrollBy({ left: offset, behavior: 'smooth' });
    }
  }, [activeIndex]);

  if (length === 0) return null;

  const currentItem = items[activeIndex];
  const heroImage = getProxiedImageUrl(currentItem.backgroundImage || currentItem.coverImage);

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + length) % length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % length);
  };

  return (
    <section
      className="space-y-5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <BadgeCheck className="w-6 h-6 text-white shrink-0" />
        <h2 className="text-2xl font-black tracking-tight text-white">اختيار المحررين</h2>
      </div>

      {/* Main Featured Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
        {/* Large Rounded Image with Start Reading Pill */}
        <div className="lg:col-span-7 relative aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentItem.id}
              src={heroImage}
              alt={currentItem.title}
              initial={{ opacity: 0.35, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0.35 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent pointer-events-none" />

          <Link
            to={`/series/${currentItem.slug}`}
            className="absolute bottom-3.5 left-3.5 sm:bottom-4 sm:left-4 z-10 px-5 py-2.5 rounded-full bg-zinc-900/80 hover:bg-zinc-800 backdrop-blur-md text-white text-xs sm:text-sm font-bold flex items-center gap-2 border border-white/15 shadow-lg transition-all active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>ابدأ القراءة</span>
          </Link>
        </div>

        {/* Title & Synopsis */}
        <div className="lg:col-span-5 text-right space-y-2.5" dir="auto">
          <Link
            to={`/series/${currentItem.slug}`}
            className="block text-xl sm:text-2xl lg:text-3xl font-black text-white hover:text-emerald-400 transition-colors leading-snug"
          >
            {currentItem.title}
          </Link>
          {currentItem.description && (
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed line-clamp-3 lg:line-clamp-5">
              {currentItem.description}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Thumbnail Strip with Left / Right Arrows */}
      <div className="relative" dir="ltr">
        <div
          ref={thumbStripRef}
          className="flex items-center justify-start lg:justify-center gap-3 overflow-x-auto hide-scrollbar py-1 px-6"
        >
          {items.map((item, idx) => {
            const isActive = idx === activeIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={item.title}
                className={`w-[27vw] max-w-[118px] sm:w-[125px] md:w-[135px] aspect-[3/4] shrink-0 rounded-xl overflow-hidden bg-zinc-900 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'border-2 border-white opacity-100 scale-[1.03] shadow-xl'
                    : 'border border-white/10 opacity-45 hover:opacity-80'
                }`}
              >
                <img
                  src={getProxiedImageUrl(item.coverImage)}
                  alt={item.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>

        {length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              aria-label="السابق"
              className="absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-zinc-900/90 hover:bg-zinc-800 backdrop-blur-md text-white border border-white/15 shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="التالي"
              className="absolute right-1 sm:right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-zinc-900/90 hover:bg-zinc-800 backdrop-blur-md text-white border border-white/15 shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
};
