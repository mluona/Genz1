import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Bookmark, User } from 'lucide-react';
import { motion } from 'motion/react';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Determine scroll direction
      if (currentScrollY < 15) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setIsVisible(false); // scrolling down
      } else {
        setIsVisible(true); // scrolling up
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Hide on Reader page
  const isReaderPage = location.pathname.split('/').length >= 4 && location.pathname.includes('/series/');
  if (isReaderPage) return null;
  
  const navItems = [
    { icon: Home, label: 'الرئيسية', path: '/' },
    { icon: BookOpen, label: 'الروايات', path: '/novels' },
    { icon: Bookmark, label: 'المكتبة', path: '/library' },
    { icon: User, label: 'الحساب', path: '/profile' },
  ];

  return (
    <motion.nav 
      animate={{ 
        y: isVisible ? 0 : 100, 
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.98
      }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="sm:hidden fixed bottom-0 left-0 right-0 w-full bg-zinc-950/80 backdrop-blur-lg border-t border-white/10 z-50 px-6 py-2 shadow-sm"
    >
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 transition-all duration-200 ${isActive ? 'text-emerald-500 scale-105' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <div className={`p-1 rounded-lg transition-colors ${isActive ? 'bg-emerald-500/10' : ''}`}>
                <item.icon className="w-[18px] h-[18px]" />
              </div>
              <span className="text-[9px] font-black tracking-wide">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
};

