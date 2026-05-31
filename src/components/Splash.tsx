import React, { useEffect } from 'react';
import { motion } from 'motion/react';

interface SplashProps {
  onComplete: () => void;
}

export const Splash: React.FC<SplashProps> = ({ onComplete }) => {
  useEffect(() => {
    // Auto-complete after 2.5 seconds of pure elegant animation
    const timeout = setTimeout(() => {
      onComplete();
    }, 2500);

    return () => {
      clearTimeout(timeout);
    };
  }, [onComplete]);

  // Letter animations for the brand "GENZ"
  const brandLetters = ["G", "E", "N", "Z"];

  const letterVariants = {
    hidden: { y: 40, opacity: 0 },
    visible: (i: number) => ({
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.15,
        type: "spring" as const,
        stiffness: 120,
        damping: 14,
      },
    }),
  };

  return (
    <motion.div
      id="splash-container"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center select-none overflow-hidden"
    >
      {/* Premium subtle background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Branding Logo & Slogan */}
      <div className="text-center z-10 space-y-6">
        <div className="flex justify-center items-center gap-1.5 overflow-hidden py-2" dir="ltr">
          {brandLetters.map((letter, index) => (
            <motion.span
              key={index}
              custom={index}
              initial="hidden"
              animate="visible"
              variants={letterVariants}
              className="text-6xl sm:text-8xl font-black italic tracking-tighter text-white"
              style={{
                textShadow: "0 4px 20px rgba(255,255,255,0.1), 0 0 40px rgba(16,185,129,0.15)",
                fontFamily: "font-sans"
              }}
            >
              {letter}
            </motion.span>
          ))}
          <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 150, damping: 10 }}
            className="w-3.5 h-3.5 sm:w-5 sm:h-5 bg-emerald-500 rounded-lg transform rotate-12 relative -bottom-1"
          />
        </div>

        {/* Elegant Arabic Tagline - Minimalist, pure high-contrast text */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 1, ease: 'easeOut' }}
          className="text-xs sm:text-sm font-black text-zinc-400 tracking-[0.25em] uppercase font-mono"
        >
          أطلق العنان لخيالك
        </motion.p>
      </div>

      {/* Footer minimal info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-6 text-[9px] font-mono text-zinc-600 tracking-widest uppercase text-center"
      >
        GENZ ENTERTAINMENT &bull; v2.0
      </motion.div>
    </motion.div>
  );
};
