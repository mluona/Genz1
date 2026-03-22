import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { BackToTop } from './components/BackToTop';
import { Home } from './pages/Home';
import { SeriesDetail } from './pages/SeriesDetail';
import { Reader } from './pages/Reader';
import { Profile } from './pages/Profile';
import { Library } from './pages/Library';
import { Novels } from './pages/Novels';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { SeriesManagement } from './pages/admin/SeriesManagement';
import { ChapterManagement } from './pages/admin/ChapterManagement';
import { AutoImport } from './pages/admin/AutoImport';
import { UserManagement } from './pages/admin/UserManagement';
import { CommentModeration } from './pages/admin/CommentModeration';
import { PageManagement } from './pages/admin/PageManagement';
import { CoinPackagesManagement } from './pages/admin/CoinPackagesManagement';

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen overflow-x-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white font-sans selection:bg-emerald-500/30 selection:text-emerald-200 transition-colors duration-300">
            <Routes>
              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="series" element={<SeriesManagement />} />
                <Route path="chapters" element={<ChapterManagement />} />
                <Route path="import" element={<AutoImport />} />
                <Route path="users" element={<UserManagement />} />
                <Route path="comments" element={<CommentModeration />} />
                <Route path="pages" element={<PageManagement />} />
                <Route path="coins" element={<CoinPackagesManagement />} />
                <Route path="analytics" element={<div>Analytics Page (Coming Soon)</div>} />
              </Route>

              {/* Main Site Routes */}
              <Route
                path="*"
                element={
                  <div className="relative main-app">
                    <div className="atmosphere" />
                    <Navbar />
                    <main className="relative z-10">
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
                    </main>
                    <BottomNav />
                    <BackToTop />
                  </div>
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
