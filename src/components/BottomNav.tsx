import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, Bookmark, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  
  // Hide on Reader page
  const isReaderPage = location.pathname.split('/').length >= 4 && location.pathname.includes('/series/');
  if (isReaderPage) return null;
  
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: BookOpen, label: 'Novels', path: '/novels' },
    { icon: Bookmark, label: 'Library', path: '/library' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-zinc-900/80 backdrop-blur-xl border-t border-white/5 z-50 px-6 py-3">
      <div className="flex items-center justify-between max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 transition-all duration-200 ${isActive ? 'text-emerald-500' : 'text-zinc-500'}`}
            >
              <div className={`p-1 rounded-xl transition-colors ${isActive ? 'bg-emerald-500/10' : ''}`}>
                <item.icon className={`w-6 h-6 ${isActive ? 'fill-current' : ''}`} />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
