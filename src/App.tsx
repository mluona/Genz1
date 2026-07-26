import React, { useState, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { BackToTop } from './components/BackToTop';
import { Footer } from './components/Footer';
import { Splash } from './components/Splash';
import { TrafficTracker } from './components/TrafficTracker';
import { AnimatePresence } from 'motion/react';

const Home = lazy(() => import('./pages/Home').then(m => ({ default: m.Home })));
const SeriesDetail = lazy(() => import('./pages/SeriesDetail').then(m => ({ default: m.SeriesDetail })));
const Reader = lazy(() => import('./pages/Reader').then(m => ({ default: m.Reader })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const Library = lazy(() => import('./pages/Library').then(m => ({ default: m.Library })));
const Novels = lazy(() => import('./pages/Novels').then(m => ({ default: m.Novels })));

const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard })));
const SeriesManagement = lazy(() => import('./pages/admin/SeriesManagement').then(m => ({ default: m.SeriesManagement })));
const ChapterManagement = lazy(() => import('./pages/admin/ChapterManagement').then(m => ({ default: m.ChapterManagement })));
const UserManagement = lazy(() => import('./pages/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const CommentModeration = lazy(() => import('./pages/admin/CommentModeration').then(m => ({ default: m.CommentModeration })));
const PageManagement = lazy(() => import('./pages/admin/PageManagement').then(m => ({ default: m.PageManagement })));
const CoinPackagesManagement = lazy(() => import('./pages/admin/CoinPackagesManagement').then(m => ({ default: m.CoinPackagesManagement })));

function MainSiteContainer() {
  const location = useLocation();
  // Check if it's the reader page /series/:slug/:chapterNum (has 3 segments after splitting)
  const isReaderPage = location.pathname.includes('/series/') && location.pathname.split('/').filter(Boolean).length === 3;

  return (
    <div className="relative main-app">
      <div className="atmosphere" />
      <Navbar />
      <main className="relative z-10">
        <Suspense fallback={<div className="flex h-[80vh] items-center justify-center"><div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/series/:slug" element={<SeriesDetail />} />
            <Route path="/series/:slug/:chapterNum" element={<Reader />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/library" element={<Library />} />
            <Route path="/novels" element={<Novels />} />
            <Route path="/manga" element={<Library />} />
            <Route path="/manhwa" element={<Library />} />
            <Route path="/search" element={<Library />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>
      {!isReaderPage && <Footer />}
      <BottomNav />
      <BackToTop />
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <TrafficTracker />
            <div dir="rtl" className="min-h-screen overflow-x-hidden bg-zinc-950 text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-200 transition-colors duration-300">
              <AnimatePresence mode="wait">
                {showSplash && (
                  <Splash key="splash" onComplete={handleSplashComplete} />
                )}
              </AnimatePresence>
              
              <Suspense fallback={<div className="flex h-screen items-center justify-center bg-zinc-950"><div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div></div>}>
                <Routes>
                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboard />} />
                    <Route path="series" element={<SeriesManagement />} />
                    <Route path="chapters" element={<ChapterManagement />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="comments" element={<CommentModeration />} />
                    <Route path="pages" element={<PageManagement />} />
                    <Route path="coins" element={<CoinPackagesManagement />} />
                    <Route path="analytics" element={<div>Analytics Page (Coming Soon)</div>} />
                  </Route>

                  {/* Main Site Routes */}
                  <Route path="*" element={<MainSiteContainer />} />
                </Routes>
              </Suspense>
          </div>
        </Router>
      </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
