import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  Users, 
  BarChart3, 
  MessageSquare, 
  FileText, 
  Settings, 
  LogOut, 
  Download, 
  Plus, 
  Search,
  Bell,
  Globe,
  Menu,
  X,
  Coins
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { profile, isAdmin, loading, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth >= 1024);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white" dir="rtl">
        <div className="text-center">
          <h1 className="text-4xl font-black mb-4">تم رفض الوصول</h1>
          <p className="text-zinc-500 mb-8">ليس لديك الصلاحية الكافية لعرض هذه الصفحة المخصصة للإدارة.</p>
          <Link to="/" className="px-8 py-3 bg-emerald-500 text-black font-bold rounded-full">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', path: '/admin' },
    { icon: BookOpen, label: 'الأعمال والقصص', path: '/admin/series' },
    { icon: Layers, label: 'الفصول', path: '/admin/chapters' },
    { icon: Users, label: 'المستخدمين', path: '/admin/users' },
    { icon: MessageSquare, label: 'التعليقات', path: '/admin/comments' },
    { icon: FileText, label: 'الصفحات', path: '/admin/pages' },
    { icon: Coins, label: 'باقات الكوينز', path: '/admin/coins' },
    { icon: BarChart3, label: 'التحليلات والمبيعات', path: '/admin/analytics' },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex text-zinc-900 flex-row-reverse" dir="rtl">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 right-0 z-50 w-64 bg-zinc-900 text-white transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between flex-row-reverse">
            <Link to="/" className="flex items-center gap-2 flex-row-reverse">
              <span className="text-2xl font-black tracking-tighter">لوحة التحكم</span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest bg-zinc-800 px-2 py-0.5 rounded-full">المدير</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-zinc-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${isActive ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:bg-white/5 hover:text-white'} flex-row`}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-zinc-400 hover:bg-red-500/10 hover:text-red-500 transition-colors flex-row"
            >
              <LogOut className="w-5 h-5 shrink-0" />
              <span>تسجيل الخروج</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'lg:mr-64' : 'mr-0'} w-full min-w-0 text-right`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white border-b border-zinc-200 px-4 sm:px-8 py-4 flex items-center justify-between flex-row-reverse">
          <div className="flex items-center gap-4 flex-row-reverse">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg lg:hidden">
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input 
                type="text" 
                placeholder="ابحث في الإدارة..." 
                className="bg-zinc-100 border-none rounded-full py-2 pr-10 pl-4 text-sm w-64 focus:ring-2 focus:ring-emerald-500/20 text-right"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 flex-row-reverse">
            <button className="relative p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="flex items-center gap-3 flex-row-reverse">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold">{profile?.username}</p>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">المدير العام</p>
              </div>
              <img 
                src={profile?.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.id}`} 
                className="w-10 h-10 rounded-full border border-zinc-200" 
                alt="Admin" 
              />
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-8 overflow-x-hidden">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
