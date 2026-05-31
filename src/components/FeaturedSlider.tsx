import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Series } from '../types';
import { getProxiedImageUrl } from '../utils/imageUtils';

interface FeaturedSliderProps {
  seriesList: Series[];
}

export const FeaturedSlider: React.FC<FeaturedSliderProps> = ({ seriesList }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left/prev, 1 for right/next
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef<(() => void) | null>(null);

  const length = seriesList.length;

  const nextSlide = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % length);
  };

  const prevSlide = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + length) % length);
  };

  useEffect(() => {
    autoPlayRef.current = nextSlide;
  });

  useEffect(() => {
    if (isHovered || length <= 1) return;
    const play = () => {
      if (autoPlayRef.current) autoPlayRef.current();
    };
    const interval = setInterval(play, 5000);
    return () => clearInterval(interval);
  }, [isHovered, length]);

  if (!seriesList || seriesList.length === 0) return null;

  const currentSeries = seriesList[currentIndex];

  // Motion Variants for clean sliding transitions
  const slideVariants: any = {
    enter: (dir: number) => ({
      x: dir > 0 ? -150 : 150,
      opacity: 0,
      scale: 0.98,
    }),
    center: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: "spring" as const, stiffness: 240, damping: 28 },
        opacity: { duration: 0.4 },
        scale: { duration: 0.4, ease: "easeOut" }
      }
    },
    exit: (dir: number) => ({
      x: dir > 0 ? 150 : -150,
      opacity: 0,
      scale: 0.98,
      transition: {
        x: { type: "spring" as const, stiffness: 240, damping: 28 },
        opacity: { duration: 0.3 }
      }
    })
  };

  // Handle Drag / Swipe gestures
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 50;
    if (info.offset.x > swipeThreshold) {
      // Swiped right relative to the grid direction
      prevSlide();
    } else if (info.offset.x < -swipeThreshold) {
      // Swiped left relative to the grid direction
      nextSlide();
    }
  };

  // Select the preferred scenic image to show (preferred: backgroundImage, fallback: coverImage)
  const displayImage = currentSeries.backgroundImage || currentSeries.coverImage;

  return (
    <div 
      className="relative w-full max-w-7xl mx-auto px-4 md:px-0 h-[280px] sm:h-[350px] md:h-[450px] lg:h-[500px] overflow-hidden group select-none md:rounded-[2.5rem]"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Immersive Cinematic Background Glow Filter */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-black">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.img
            key={`bg-${currentSeries.id}`}
            src={getProxiedImageUrl(displayImage)}
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 0.35, scale: 1.05 }}
            exit={{ opacity: 0, scale: 1.12 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full object-cover filter blur-[35px] pointer-events-none"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent z-10" />
      </div>

      {/* Main Image Slider Interactivity Layer */}
      <div className="absolute inset-0 z-20 flex items-center justify-center">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={currentSeries.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={handleDragEnd}
            className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing p-2 sm:p-4"
          >
            <Link 
              to={`/series/${currentSeries.slug}`}
              className="block w-full h-full relative overflow-hidden rounded-[1.5rem] md:rounded-[2rem] border border-white/10 bg-zinc-950 group/link"
              style={{
                boxShadow: '0 30px 70px -10px rgba(0, 0, 0, 0.95), 0 0 50px rgba(16, 185, 129, 0.08)'
              }}
            >
              {/* Premium full-bleed cover / background image (high-quality resolution rendering) */}
              <img
                src={getProxiedImageUrl(displayImage)}
                alt={currentSeries.title}
                className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover/link:scale-[1.04]"
                referrerPolicy="no-referrer"
                style={{ imageRendering: 'auto' }}
                draggable={false}
              />
              
              {/* Ultra-smooth cinematic dark vignette gradient to protect text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent transition-opacity duration-300 group-hover/link:from-black/100" />
              
              {/* Minimal light sheen highlight */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 pointer-events-none opacity-0 group-hover/link:opacity-100 transition-opacity duration-700" />

              {/* Title & Metadata Overlay - Placed elegantly inside the bottom-right image boundaries */}
              <div className="absolute bottom-6 right-6 left-6 md:bottom-12 md:right-12 md:left-12 z-20 text-right space-y-3 pointer-events-none">
                {/* Visual Category Badge Grid */}
                <div className="flex flex-wrap items-center gap-2" dir="rtl">
                  {currentSeries.type && (
                    <span className="px-2.5 py-0.5 bg-emerald-500 text-black text-[10px] font-black uppercase tracking-wider rounded">
                      {currentSeries.type === 'Novel' ? 'رواية مميزة' : currentSeries.type === 'Manga' ? 'مانجا مميزة' : 'عمل متميز'}
                    </span>
                  )}
                  {currentSeries.status && (
                    <span className="px-2.5 py-0.5 bg-white/10 backdrop-blur-md text-zinc-300 text-[10px] font-bold rounded">
                      {currentSeries.status === 'Ongoing' ? 'مستمر' : 'مكتمل'}
                    </span>
                  )}
                  {currentSeries.rating && (
                    <span className="px-2.5 py-0.5 bg-zinc-950/60 backdrop-blur-md text-emerald-400 text-[10px] font-black rounded flex items-center gap-1 border border-emerald-550/10">
                      ★ {currentSeries.rating.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Main Work Title */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight select-text drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)] transition-transform duration-500 group-hover/link:translate-y-[-2px]">
                  {currentSeries.title}
                </h1>

                {/* Author Name */}
                {currentSeries.author && (
                  <p className="text-zinc-300/95 text-xs sm:text-sm font-semibold tracking-wide drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] max-w-xl line-clamp-1">
                    بواسطة / <span className="text-white font-bold">{currentSeries.author}</span>
                  </p>
                )}

                {/* Short teaser caption inside image area */}
                {currentSeries.description && (
                  <p className="text-zinc-400/90 text-xs sm:text-sm leading-relaxed max-w-2xl line-clamp-2 md:line-clamp-3 select-text drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] hidden sm:block">
                    {currentSeries.description}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Navigation Buttons (hidden on mobile, visible on desktop hover) */}
      <div 
        className="absolute top-1/2 -translate-y-1/2 left-6 z-30 transition-all duration-300 transform translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 hidden md:block"
        dir="ltr"
      >
        <button 
          onClick={prevSlide}
          className="p-3.5 bg-zinc-950/80 hover:bg-emerald-500 text-white hover:text-black hover:scale-110 active:scale-95 rounded-2xl border border-white/5 transition-all shadow-2xl"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
      
      <div 
        className="absolute top-1/2 -translate-y-1/2 right-6 z-30 transition-all duration-300 transform -translate-x-3 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 hidden md:block"
        dir="ltr"
      >
        <button 
          onClick={nextSlide}
          className="p-3.5 bg-zinc-950/80 hover:bg-emerald-500 text-white hover:text-black hover:scale-110 active:scale-95 rounded-2xl border border-white/5 transition-all shadow-2xl"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Elegant Dot Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-35 flex items-center gap-1.5 bg-zinc-950/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
        {seriesList.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className="py-1 px-1 focus:outline-none transition-all"
          >
            <div 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'w-5 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' 
                  : 'w-1.5 bg-white/30 hover:bg-white/60'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};
