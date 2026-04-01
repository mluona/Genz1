import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, LogIn, User, LayoutDashboard, Menu, X, Bell, LogOut, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'motion/react';
import { LoginModal } from './LoginModal';

export const Navbar: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Hide Navbar on Reader page
  const isReaderPage = location.pathname.split('/').length >= 4 && location.pathname.includes('/series/');
  if (isReaderPage) return null;

  const handleLogin = () => {
    setIsLoginModalOpen(true);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/');
    } catch (error: any) {
      console.error("Logout failed:", error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] bg-zinc-950/40 backdrop-blur-2xl border-b border-white/5">
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter text-white leading-none">GENZ</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/manga" className="text-[10px] font-black text-zinc-400 hover:text-emerald-500 transition-all uppercase tracking-widest">Manga</Link>
            <Link to="/manhwa" className="text-[10px] font-black text-zinc-400 hover:text-emerald-500 transition-all uppercase tracking-widest">Manhwa</Link>
            <Link to="/novels" className="text-[10px] font-black text-zinc-400 hover:text-emerald-500 transition-all uppercase tracking-widest">Novels</Link>
          </div>

          {/* Search & User */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
            <button 
              onClick={toggleTheme}
              className="p-2.5 text-zinc-400 hover:text-emerald-500 hover:bg-white/5 rounded-2xl transition-all"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <form onSubmit={handleSearch} className="relative group">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-32 lg:w-48 bg-zinc-900/40 border border-white/5 rounded-2xl py-2 pl-10 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-zinc-900/80 transition-all placeholder:text-zinc-600 focus:w-64"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
            </form>

            {user ? (
              <div className="flex items-center gap-3 lg:gap-4">
                <Link to="/notifications" className="p-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all relative">
                  <Bell className="w-4 h-4" />
                  <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-emerald-500 rounded-full border-2 border-zinc-950" />
                </Link>
                
                {isAdmin && (
                  <Link to="/admin" className="p-2.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 rounded-2xl transition-all" title="Admin Dashboard">
                    <LayoutDashboard className="w-4 h-4" />
                  </Link>
                )}

                <div className="h-6 w-px bg-white/5 mx-1" />

                <Link to="/profile" className="relative group shrink-0">
                  <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500 to-blue-500 rounded-full blur opacity-0 group-hover:opacity-40 transition duration-500" />
                  <img
                    src={profile?.profilePicture || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                    alt="Profile"
                    className="relative w-9 h-9 rounded-full border-2 border-white/10 group-hover:border-emerald-500/50 transition-all object-cover"
                    referrerPolicy="no-referrer"
                  />
                </Link>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="px-6 py-2.5 bg-white text-black text-[10px] font-black rounded-xl hover:scale-105 active:scale-95 transition-all uppercase tracking-widest shadow-xl shadow-white/5"
              >
                Login
              </button>
            )}
          </div>


          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center gap-4">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-zinc-400">
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-zinc-950 border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 py-6 space-y-6">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search series..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-emerald-500/50"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
              </form>

              <div className="grid grid-cols-2 gap-3">
                <Link to="/manga" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-3 bg-zinc-900 rounded-xl text-sm font-bold">Manga</Link>
                <Link to="/manhwa" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-3 bg-zinc-900 rounded-xl text-sm font-bold">Manhwa</Link>
                <Link to="/novels" onClick={() => setIsMenuOpen(false)} className="flex items-center justify-center py-3 bg-zinc-900 rounded-xl text-sm font-bold">Novels</Link>
                <button 
                  onClick={() => { toggleTheme(); setIsMenuOpen(false); }} 
                  className="flex items-center justify-center gap-2 py-3 bg-zinc-900 rounded-xl text-sm font-bold"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
              </div>

              {isAdmin && (
                <Link 
                  to="/admin" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-emerald-500 text-black font-black rounded-xl uppercase tracking-widest text-xs"
                >
                  <LayoutDashboard className="w-5 h-5" />
                  Admin Dashboard
                </Link>
              )}

              {user ? (
                <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-2xl">
                  <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3">
                    <img
                      src={profile?.profilePicture || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="text-sm font-bold">{profile?.username || user.user_metadata?.full_name || 'User'}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">View Profile</p>
                    </div>
                  </Link>
                  <button onClick={handleLogout} className="p-2 text-zinc-500 hover:text-red-500">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-white text-black font-black rounded-xl uppercase tracking-widest text-xs"
                >
                  <LogIn className="w-5 h-5" />
                  Login with Google
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
