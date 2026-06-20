import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, Settings, Heart, History, LogOut, Edit2, Camera, 
  ChevronRight, Coins, X, Search, Trash2, Sparkles, Filter, 
  ArrowLeft, Upload, CheckCircle, AlertCircle, BookOpen, Clock, Tag
} from 'lucide-react';
import { Series, Transaction, CoinPackage } from '../types';
import { uploadToLocal } from '../utils/localUpload';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

export const Profile: React.FC = () => {
  const { user, profile, loading, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    profilePicture: '',
  });

  const [activeTab, setActiveTab] = useState<'history' | 'favorites' | 'wallet'>('history');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [coinPackages, setCoinPackages] = useState<CoinPackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null);
  const [favoriteSeries, setFavoriteSeries] = useState<Series[]>([]);
  const [historySeries, setHistorySeries] = useState<(Series & { lastChapterId: string })[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Filters & Sorting for Favorites
  const [favoriteSearch, setFavoriteSearch] = useState('');
  const [favoriteType, setFavoriteType] = useState<string>('all');
  const [favoriteSort, setFavoriteSort] = useState<'title' | 'rating' | 'newest'>('title');

  useEffect(() => {
    if (activeTab === 'wallet' && user) {
      const fetchTransactionsAndPackages = async () => {
        try {
          const { data: txData, error: txError } = await supabase
            .from('transactions')
            .select('*')
            .eq('userId', user.id)
            .order('createdAt', { ascending: false });
          
          if (txError) throw txError;
          setTransactions((txData as Transaction[]) || []);

          const { data: pkgData, error: pkgError } = await supabase
            .from('coin_packages')
            .select('*')
            .eq('isActive', true)
            .order('coins', { ascending: true });
          
          if (pkgError) throw pkgError;
          setCoinPackages((pkgData as CoinPackage[]) || []);
        } catch (error) {
          console.error("Error fetching wallet data:", error);
        }
      };
      fetchTransactionsAndPackages();
    }
  }, [activeTab, user]);

  useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        bio: profile.bio || '',
        profilePicture: profile.profilePicture || '',
      });
    }
  }, [profile]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!profile) return;
      setIsLoadingData(true);
      
      try {
        const allSeriesIds = new Set<string>();
        profile.favorites?.forEach(id => allSeriesIds.add(id));
        profile.history?.forEach(h => allSeriesIds.add(h.seriesId));

        if (allSeriesIds.size === 0) {
          setFavoriteSeries([]);
          setHistorySeries([]);
          setIsLoadingData(false);
          return;
        }

        const idsArray = Array.from(allSeriesIds);
        const { data: seriesData, error: seriesError } = await supabase
          .from('series')
          .select('*')
          .in('id', idsArray);
        
        if (seriesError) throw seriesError;
        
        const seriesMap = new Map<string, Series>();
        seriesData?.forEach(s => seriesMap.set(s.id, s as Series));

        const uniqueFavorites = Array.from(new Set(profile.favorites || []));
        const favs = uniqueFavorites.map(id => seriesMap.get(id)).filter(Boolean) as Series[];
        setFavoriteSeries(favs);

        const hist = (profile.history || [])
          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
          .filter((h, index, self) => index === self.findIndex((t) => t.seriesId === h.seriesId))
          .map(h => {
            const s = seriesMap.get(h.seriesId);
            return s ? { ...s, lastChapterId: h.lastChapterId } : null;
          })
          .filter(Boolean) as (Series & { lastChapterId: string })[];
        setHistorySeries(hist);

      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchUserData();
  }, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-zinc-500 text-sm font-medium">جاري تحميل ملفك الشخصي...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-6 p-4">
        <div className="w-20 h-20 rounded-full bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500">
          <User className="w-10 h-10" />
        </div>
        <div className="text-center space-y-2 max-w-sm">
          <h1 className="text-2xl font-black tracking-tight text-white">الرجاء تسجيل الدخول</h1>
          <p className="text-zinc-400 text-sm">يجب عليك تسجيل الدخول أو إنشاء حساب جديد للوصول إلى الملف الشخصي وخدمات المحفظة.</p>
        </div>
        <Link to="/" className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-black font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all duration-300">
          الذهاب للرئيسية
        </Link>
      </div>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);
      
      if (error) throw error;
      await refreshProfile(user!.id);
      setIsEditing(false);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    try {
      // Create object URL for instant preview while uploading
      const objectUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, profilePicture: objectUrl }));
      
      const fileExt = file.name.split('.').pop() || 'jpg';
      const filename = `profile_pictures/${user?.id}_${Date.now()}.${fileExt}`;
      
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const base64Data = await base64Promise;
      
      const downloadUrl = await uploadToLocal(base64Data, filename, file.type);
      if (!downloadUrl) throw new Error("Upload failed, no URL returned");
      
      // Update directly so user has instantaneous persistent updates
      const { error: dbError } = await supabase
        .from('profiles')
        .update({ profilePicture: downloadUrl })
        .eq('id', user?.id || '');
      
      if (dbError) throw dbError;
      
      setFormData(prev => ({ ...prev, profilePicture: downloadUrl }));
      if (user) await refreshProfile(user.id);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
    }
  };

  const toggleFavoriteFromProfile = async (seriesId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profile || !user) return;
    
    const wasFavorite = profile.favorites?.includes(seriesId);
    let newFavorites = [...(profile.favorites || [])];
    if (wasFavorite) {
      newFavorites = newFavorites.filter(id => id !== seriesId);
    } else {
      newFavorites.push(seriesId);
    }

    // Optimistic state update for Favorites List
    setFavoriteSeries(prev => prev.filter(s => s.id !== seriesId));
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ favorites: newFavorites })
        .eq('id', user.id);
      
      if (error) throw error;
      await refreshProfile(user.id);
    } catch (error) {
      console.error('Error toggling favorite from profile:', error);
      await refreshProfile(user.id);
    }
  };

  const deleteFromHistory = async (seriesId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!profile || !user) return;
    
    const newHistory = (profile.history || []).filter(h => h.seriesId !== seriesId);
    
    // Optimistic update
    setHistorySeries(prev => prev.filter(s => s.id !== seriesId));
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ history: newHistory })
        .eq('id', user.id);
      
      if (error) throw error;
      await refreshProfile(user.id);
    } catch (error) {
      console.error('Error deleting reading history item:', error);
      await refreshProfile(user.id);
    }
  };

  const handlePurchaseCoins = async (amount: number, price: number) => {
    if (!user || !profile) return;
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          coins: (profile.coins || 0) + amount
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      const { error: transError } = await supabase
        .from('transactions')
        .insert([{
          userId: user.id,
          amount,
          type: 'purchase',
          description: `شراء ${amount} عملة بسعر $${price.toFixed(2)}`,
          timestamp: new Date().toISOString()
        }]);

      if (transError) throw transError;

      alert(`تم شراء ${amount} عملة بنجاح!`);
      setSelectedPackage(null);
      await refreshProfile(user.id);
      
      // Update transaction list in wallet
      const { data: txData } = await supabase
        .from('transactions')
        .select('*')
        .eq('userId', user.id)
        .order('createdAt', { ascending: false });
      
      setTransactions((txData as Transaction[]) || []);
    } catch (error) {
      console.error("Error purchasing coins:", error);
      alert("فشل شراء العملات");
    }
  };

  // Filter Favorite series
  const filteredFavorites = favoriteSeries
    .filter(s => {
      const matchesSearch = s.title.toLowerCase().includes(favoriteSearch.toLowerCase()) || 
        (s.description && s.description.toLowerCase().includes(favoriteSearch.toLowerCase()));
      const matchesType = favoriteType === 'all' ? true : s.type.toLowerCase() === favoriteType.toLowerCase();
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (favoriteSort === 'title') {
        return a.title.localeCompare(b.title, ['ar', 'en']);
      } else if (favoriteSort === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      } else {
        return b.id.localeCompare(a.id);
      }
    });

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24 font-sans text-right" dir="rtl">
      {/* Immersive background aura */}
      <div className="relative h-[25vh] bg-gradient-to-b from-emerald-950/20 via-zinc-900 to-zinc-950 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent animate-pulse duration-[10000ms]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.01)_1px,_transparent_1px)] bg-[size:32px_32px]" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Profile Sidebar */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
            <div className="bg-zinc-900/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 text-center space-y-6 shadow-2xl relative overflow-hidden group">
              <div className="absolute -right-12 -top-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/15 transition-all" />
              
              {/* Profile Avatar Container with Live Upload Indicator */}
              <div className="relative inline-block mt-4">
                <div 
                  onClick={triggerFileSelect}
                  className="relative w-32 h-32 rounded-full cursor-pointer overflow-hidden border-4 border-zinc-950 shadow-2xl mx-auto group/avatar transition-transform duration-300 active:scale-95"
                >
                  <img 
                    src={formData.profilePicture || profile?.profilePicture || user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} 
                    className={`w-full h-full object-cover transition-all duration-300 group-hover/avatar:scale-110 ${isUploading ? 'opacity-40 animate-pulse' : ''}`} 
                    alt="Profile" 
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                    <Camera className="w-6 h-6 text-emerald-400" />
                  </div>

                  {/* Uploading Spinner */}
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] text-emerald-400 mt-2 font-bold font-mono">...جاري الرفع</span>
                    </div>
                  )}
                </div>

                {/* Instant Action Floating Button */}
                <button 
                  onClick={triggerFileSelect}
                  className="absolute bottom-1 hover:scale-110 active:scale-95 left-2 p-2.5 bg-emerald-500 text-black rounded-full shadow-lg transition-transform"
                  title="تغيير الصورة الشخصية"
                >
                  <Camera className="w-4 h-4" />
                </button>

                {/* Hidden input */}
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden" 
                />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                  {profile?.username}
                  {profile?.role === 'admin' && (
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  )}
                </h2>
                <p className="text-zinc-500 text-xs font-semibold font-mono">{user.email}</p>
              </div>

              <p className="text-zinc-400 text-sm leading-relaxed px-2 bg-zinc-950/40 py-3 rounded-2xl border border-white/[0.02]">
                {profile?.bio || "لا توجد نبذة تعريفية بعد."}
              </p>

              <div className="flex flex-wrap gap-2 justify-center">
                <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-xl ${profile?.role === 'admin' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
                  {profile?.role === 'admin' ? 'مدير النظام' : 'عضو ذهبي'}
                </span>
              </div>

              <div className="pt-4 border-t border-white/5 space-y-2">
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className={`w-full flex items-center justify-center gap-2 py-3 font-bold rounded-2xl transition-all duration-300 ${isEditing ? 'bg-zinc-700 text-white hover:bg-zinc-600' : 'bg-white text-black hover:bg-zinc-200'}`}
                >
                  <Edit2 className="w-4 h-4" /> {isEditing ? "إلغاء التعديل" : "تعديل الحساب"}
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-950/50 text-red-500 font-bold rounded-2xl hover:bg-red-500/10 transition-colors border border-red-500/10"
                >
                  <LogOut className="w-4 h-4" /> تسجيل الخروج
                </button>
              </div>
            </div>

            {/* Statistics and Quick Info */}
            <div className="bg-zinc-900/80 backdrop-blur-md border border-white/5 rounded-[2.5rem] p-6 space-y-6 shadow-2xl">
              <h3 className="font-black text-sm tracking-widest text-zinc-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-500" /> الإحصائيات العامة
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center p-4 bg-zinc-950/60 rounded-2xl border border-white/5 hover:border-emerald-500/20 transition-colors">
                  <p className="text-2xl font-black text-emerald-400">{profile?.favorites?.length || 0}</p>
                  <p className="text-[10px] mt-1 font-black text-zinc-500 tracking-widest">المفضلة</p>
                </div>
                <div className="text-center p-4 bg-zinc-950/60 rounded-2xl border border-white/5 hover:border-blue-500/20 transition-colors">
                  <p className="text-2xl font-black text-blue-400">{profile?.history?.length || 0}</p>
                  <p className="text-[10px] mt-1 font-black text-zinc-500 tracking-widest">السجل</p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/5">
                <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-transparent border border-amber-500/20 rounded-3xl p-5 text-center relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/10 rounded-full blur-xl translate-x-4 -translate-y-4" />
                  <Coins className="w-10 h-10 text-amber-500 mx-auto mb-3 animate-bounce duration-1000" />
                  <p className="text-3xl font-black text-amber-500 tracking-tight font-mono hover:scale-105 transition-transform">{profile?.coins || 0}</p>
                  <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest mt-1">العملات المتاحة</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 w-full space-y-8">
            
            {isEditing ? (
              <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden animate-in fade-in duration-300">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
                    <Settings className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-black">إعدادات الحساب</h3>
                </div>
                
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2">اسم المستخدم</label>
                    <input 
                      type="text" 
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                      className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-4 py-3.5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none text-white font-medium"
                      placeholder="أدخل اسم مستخدم جديد..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2">النبذة التعريفية</label>
                    <textarea 
                      rows={4}
                      value={formData.bio}
                      onChange={e => setFormData({...formData, bio: e.target.value})}
                      className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-4 py-3.5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none resize-none text-white font-medium text-sm leading-relaxed"
                      placeholder="نبذة بسيطة تظهر لبقية المستخدمين..."
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2">رابط صورة الملف الشخصي</label>
                    <input 
                      type="text" 
                      value={formData.profilePicture}
                      onChange={e => setFormData({...formData, profilePicture: e.target.value})}
                      className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-4 py-3.5 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 outline-none text-white font-medium"
                      placeholder="أدخل رابط صورة (مثل https://imgur.com/...)"
                      dir="ltr"
                    />
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-white/5">
                    <button 
                      type="submit" 
                      className="px-8 py-3.5 bg-emerald-500 text-black font-black uppercase tracking-wider rounded-2xl hover:bg-emerald-400 shadow-lg active:scale-95 transition-all duration-200"
                    >
                      حفظ التغييرات
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setIsEditing(false)} 
                      className="px-8 py-3.5 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-2xl active:scale-95 transition-all duration-200"
                    >
                      إلغاء
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Horizontal Sliding Tab Navbar */}
                <div className="flex items-center gap-2 p-1.5 bg-zinc-900 border border-white/5 rounded-2xl overflow-x-auto no-scrollbar shadow-lg">
                  <button 
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-black transition-all duration-300 rounded-xl whitespace-nowrap ${activeTab === 'history' ? 'bg-white text-black shadow-lg scale-[1.02]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                  >
                    <History className="w-4 h-4" />
                    سجل القراءة
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('favorites')}
                    className={`flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-black transition-all duration-300 rounded-xl whitespace-nowrap ${activeTab === 'favorites' ? 'bg-white text-black shadow-lg scale-[1.02]' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                  >
                    <Heart className="w-4 h-4" />
                    المفضلة
                  </button>
                  
                  <button 
                    onClick={() => setActiveTab('wallet')}
                    className={`flex items-center gap-2 px-6 py-3 text-xs sm:text-sm font-black transition-all duration-300 rounded-xl whitespace-nowrap ${activeTab === 'wallet' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-[1.02]' : 'text-zinc-500 hover:text-amber-500 hover:bg-amber-500/5'}`}
                  >
                    <Coins className="w-4 h-4" />
                    المحفظة الرقمية
                  </button>
                </div>

                {/* FAVORITES TAB CONTENT WITH ADVANCED FILTERS */}
                {activeTab === 'favorites' && (
                  <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className="bg-zinc-900/40 p-4 rounded-3xl border border-white/5 space-y-4">
                      {/* Search and Filters Header */}
                      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        
                        {/* Search input */}
                        <div className="relative w-full md:w-72">
                          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                          <input 
                            type="text" 
                            placeholder="ابحث في مفضلتك..." 
                            value={favoriteSearch}
                            onChange={e => setFavoriteSearch(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/5 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-white focus:border-emerald-500/50 outline-none"
                          />
                          {favoriteSearch && (
                            <button onClick={() => setFavoriteSearch('')} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Filters & Sorters */}
                        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
                          {/* Types Selector */}
                          <div className="flex bg-zinc-950 p-1 rounded-xl border border-white/5 text-[10px] font-bold">
                            {['all', 'Manga', 'Manhwa', 'Novel'].map(type => (
                              <button 
                                key={type}
                                onClick={() => setFavoriteType(type)}
                                className={`px-3 py-1.5 rounded-lg whitespace-nowrap ${favoriteType === type ? 'bg-emerald-500 text-black font-black' : 'text-zinc-400 hover:text-white'}`}
                              >
                                {type === 'all' ? 'الكل' : type === 'Manga' ? 'مانجا' : type === 'Manhwa' ? 'مانهوا' : 'رواية'}
                              </button>
                            ))}
                          </div>

                          {/* Sorter Selector */}
                          <select 
                            value={favoriteSort} 
                            onChange={e => setFavoriteSort(e.target.value as any)}
                            className="bg-zinc-950 border border-white/5 rounded-xl px-3 py-1.5 text-[10px] font-bold text-zinc-300 outline-none focus:border-emerald-500/50"
                          >
                            <option value="title">الترتيب الأبجدي</option>
                            <option value="rating">الأعلى تقييماً</option>
                            <option value="newest">المضافة حديثاً</option>
                          </select>
                        </div>

                      </div>
                    </div>

                    {/* Favorites Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {isLoadingData ? (
                        <div className="col-span-full py-16 flex flex-col items-center justify-center gap-3">
                          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-zinc-500 text-xs font-medium">جاري تحميل المفضلة...</p>
                        </div>
                      ) : filteredFavorites.length === 0 ? (
                        <div className="col-span-full py-16 bg-zinc-900/20 border border-dashed border-white/5 rounded-3xl text-center space-y-4">
                          <Heart className="w-12 h-12 text-zinc-600 mx-auto" />
                          <div className="space-y-1">
                            <h4 className="font-bold text-zinc-400">لا توجد أعمال في المفضلة</h4>
                            <p className="text-zinc-600 text-xs max-w-xs mx-auto">عند قيامك بحفظ المانجا أو الروايات المفضلة لديك، ستظهر مجدداً هنا للوصول السريع إليها.</p>
                          </div>
                        </div>
                      ) : (
                        filteredFavorites.map(series => {
                          // Check if we have progress for this manga in our reading history
                          const matchedHistory = historySeries.find(h => h.id === series.id);
                          
                          return (
                            <div 
                              key={series.id} 
                              className="group relative aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border border-white/5 hover:border-emerald-400/20 transition-all duration-300"
                            >
                              <img 
                                src={series.coverImage || undefined} 
                                alt={series.title} 
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                                referrerPolicy="no-referrer" 
                              />
                              {/* Dark subtle gradient overlay */}
                              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/30 to-black/40 opacity-90 group-hover:opacity-100 transition-opacity" />

                              {/* Interactive Instant toggle favorites (heart) button */}
                              <button 
                                onClick={(e) => toggleFavoriteFromProfile(series.id, e)}
                                className="absolute top-3 left-3 p-2 bg-black/60 backdrop-blur-md rounded-full border border-white/5 hover:scale-110 active:scale-95 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 text-emerald-400 transition-all duration-200 shadow-xl"
                                title="إزالة من المفضلة"
                              >
                                <Heart className="w-3.5 h-3.5 fill-current" />
                              </button>

                              {/* Badges / Rating overlay */}
                              <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
                                <span className={`px-2 py-0.5 text-[8px] font-black uppercase rounded-md tracking-wider ${series.status === 'Ongoing' ? 'bg-emerald-500 text-black' : 'bg-blue-500 text-white'}`}>
                                  {series.status === 'Ongoing' ? 'مستمر' : 'مكتمل'}
                                </span>
                              </div>

                              <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                                <h4 className="font-extrabold text-sm truncate text-white leading-tight" dir="auto">
                                  {series.title}
                                </h4>
                                
                                <div className="flex items-center justify-between">
                                  <span className="text-[9px] font-black tracking-widest text-emerald-400 uppercase">
                                    {series.type === 'Manga' ? 'مانجا' : series.type === 'Manhwa' ? 'مانهوا' : 'رواية'}
                                  </span>
                                  {series.rating && (
                                    <div className="flex items-center gap-1">
                                      <Sparkles className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                                      <span className="text-[10px] font-bold text-zinc-300 font-mono">{series.rating.toFixed(1)}</span>
                                    </div>
                                  )}
                                </div>

                                {/* Resume reading bridge if existing in logs */}
                                {matchedHistory && (
                                  <Link 
                                    to={`/series/${series.slug}`}
                                    className="flex items-center justify-center gap-1.5 w-full py-2 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 text-emerald-400 hover:text-black rounded-xl text-[10px] font-black transition-colors"
                                  >
                                    <BookOpen className="w-3 h-3" />
                                    متابعة القراءة
                                  </Link>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </section>
                )}

                {/* READING HISTORY TAB CONTENT */}
                {activeTab === 'history' && (
                  <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <History className="w-5 h-5 text-emerald-500" />
                        <h3 className="text-lg font-black uppercase tracking-tight">سجل التصفح والقراءة</h3>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {isLoadingData ? (
                        <div className="py-16 flex flex-col items-center justify-center gap-3">
                          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                          <p className="text-zinc-500 text-xs font-medium">جاري الحصول على سجل القراءة...</p>
                        </div>
                      ) : historySeries.length === 0 ? (
                        <div className="py-16 bg-zinc-900/20 border border-dashed border-white/5 rounded-3xl text-center space-y-4">
                          <History className="w-12 h-12 text-zinc-600 mx-auto" />
                          <div className="space-y-1">
                            <h4 className="font-bold text-zinc-400">سجل القراءة فارغ</h4>
                            <p className="text-zinc-600 text-xs max-w-xs mx-auto">لم تقم بقراءة أي فصول حتى الآن. تصفح الفصول المتاحة لاكتشاف عوالم جديدة.</p>
                          </div>
                        </div>
                      ) : (
                        historySeries.map(series => {
                          const historyObject = profile?.history?.find(h => h.seriesId === series.id);
                          const lastReadTime = historyObject?.timestamp 
                            ? new Date(historyObject.timestamp).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' })
                            : 'غير معروف';

                          return (
                            <div 
                              key={series.id} 
                              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-zinc-900/30 hover:bg-zinc-900 border border-white/5 rounded-3xl p-4 transition-all duration-300 group"
                            >
                              <Link to={`/series/${series.slug}`} className="relative shrink-0 w-20 h-28 sm:w-16 sm:h-22 rounded-2xl overflow-hidden border border-white/5 shadow-xl">
                                <img src={series.coverImage || undefined} alt={series.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
                              </Link>
                              
                              <div className="flex-1 min-w-0 text-right space-y-2">
                                <Link to={`/series/${series.slug}`} className="inline-block">
                                  <h4 className="font-extrabold text-white text-base group-hover:text-emerald-400 leading-snug transition-colors" dir="auto">
                                    {series.title}
                                  </h4>
                                </Link>

                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-zinc-400">
                                  <span className="flex items-center gap-1 font-medium bg-zinc-950/80 px-2 py-0.5 rounded-md text-[10px] font-mono border border-white/[0.03]">
                                    <Tag className="w-3 h-3 text-emerald-500" />
                                    {series.type}
                                  </span>
                                  <span className="flex items-center gap-1 font-mono text-xs text-zinc-500">
                                    <Clock className="w-3.5 h-3.5 text-zinc-600" />
                                    آخر قراءة: {lastReadTime}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                                <Link 
                                  to={`/series/${series.slug}`} 
                                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-500 font-bold hover:bg-emerald-400 text-black text-xs rounded-xl shadow-lg transition-colors active:scale-95"
                                >
                                  استئناف القراءة
                                  <ChevronRight className="w-4 h-4" />
                                </Link>

                                {/* Direct delete from reading history capability */}
                                <button 
                                  onClick={(e) => deleteFromHistory(series.id, e)}
                                  className="p-2.5 bg-zinc-950/60 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl border border-white/5 hover:border-red-500/20 transition-all active:scale-95"
                                  title="حذف من سجل القراءة"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </section>
                )}

                {/* WALLET & TRANSACTIONS TAB */}
                {activeTab === 'wallet' && (
                  <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                    
                    {/* Coin Purchase Grid Packages */}
                    <div className="bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl" />
                      
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                          <Coins className="w-6 h-6 text-amber-500 animate-pulse" />
                          <h3 className="text-xl font-extrabold text-white">باقات الشحن المتوفرة</h3>
                        </div>
                        <span className="text-xs bg-amber-500/15 text-amber-400 font-black px-3 py-1 rounded-xl border border-amber-500/25">شحن فوري</span>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {coinPackages.length === 0 ? (
                          <div className="col-span-full text-center py-12 text-zinc-500 font-medium italic bg-zinc-950/40 rounded-3xl border border-white/5">
                            لا تتوفر باقات شحن عملات مفعلة حالياً.
                          </div>
                        ) : (
                          coinPackages.map((pkg) => (
                            <div 
                              key={pkg.id} 
                              className="bg-zinc-950/80 border border-white/5 hover:border-amber-500/20 rounded-3xl p-6 text-center transition-all duration-300 group relative overflow-hidden flex flex-col justify-between"
                            >
                              {/* Glowing background */}
                              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-amber-500/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                              
                              {(pkg.bonusCoins || 0) > 0 && (
                                <div className="absolute top-0 inset-x-0 bg-amber-500 text-black text-[10px] font-black uppercase py-1.5 tracking-wider shadow-md">
                                  بونص: +{pkg.bonusCoins} عملة إضافية 🎉
                                </div>
                              )}

                              <div className={`mt-${(pkg.bonusCoins || 0) > 0 ? '6' : '2'} space-y-4 mb-6`}>
                                <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                                  <Coins className="w-6 h-6 text-amber-500" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-3xl font-black text-white font-mono tracking-tight">{pkg.coins}</p>
                                  <p className="text-xs text-zinc-500 font-bold">عملة أساسية</p>
                                </div>
                              </div>

                              <button 
                                onClick={() => setSelectedPackage(pkg)}
                                className="w-full py-3.5 bg-zinc-900 border border-white/5 hover:bg-amber-500 text-white hover:text-black font-extrabold rounded-2xl transition-all duration-300 shadow-md active:scale-95"
                              >
                                {pkg.price.toFixed(2)} {pkg.currency || "USD"}
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Receipt Wallet logs */}
                    <div className="bg-zinc-900/60 border border-white/5 rounded-[2.5rem] p-6 sm:p-8 shadow-2xl">
                      <div className="flex items-center gap-3 mb-6">
                        <History className="w-5 h-5 text-amber-500" />
                        <h3 className="text-lg font-black uppercase tracking-tight">سجل معاملات المحفظة</h3>
                      </div>
                      
                      {transactions.length === 0 ? (
                        <div className="text-center py-12 bg-zinc-950/40 rounded-3xl border border-white/5">
                          <p className="text-zinc-500 text-sm italic">لا توجد أي معاملات سابقة بعد.</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {transactions.map(tx => (
                            <div 
                              key={tx.id} 
                              className="flex items-center justify-between p-4 bg-zinc-950/80 rounded-2xl border border-white/5 hover:border-white/10 transition-colors"
                            >
                              <div className="space-y-1 text-right">
                                <p className="font-extrabold text-sm text-zinc-100">{tx.description}</p>
                                <p className="text-[10px] text-zinc-500 font-medium font-mono">
                                  {tx.timestamp ? new Date(tx.timestamp).toLocaleString('ar-EG') : 'الآن'}
                                </p>
                              </div>
                              <div className={`font-black text-base font-mono ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {tx.amount > 0 ? '+' : ''}{tx.amount}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </section>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern PayPal Modal Backdrop */}
      {selectedPackage && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-zinc-900 border border-white/10 rounded-[2.25rem] p-6 sm:p-8 max-w-md w-full relative shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
            <button 
              onClick={() => setSelectedPackage(null)}
              className="absolute top-4 left-4 p-2.5 bg-zinc-950/80 hover:bg-white hover:text-black rounded-full border border-white/5 text-zinc-400 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="space-y-4 mb-6 pt-4 text-center">
              <div className="w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto">
                <Coins className="w-6 h-6 text-amber-500 animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-black">إتمام عملية الشراء</h3>
                <p className="text-zinc-400 text-sm">
                  شحن <span className="text-amber-500 font-extrabold">{selectedPackage.coins + (selectedPackage.bonusCoins || 0)}</span> عملة إلى محفظتك الشخصية.
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-950 rounded-2xl border border-white/5 mb-6 text-xs space-y-2">
              <div className="flex justify-between font-medium">
                <span className="text-zinc-500">الباقة المختارة:</span>
                <span className="text-white font-extrabold">{selectedPackage.coins} عملة</span>
              </div>
              {(selectedPackage.bonusCoins || 0) > 0 && (
                <div className="flex justify-between font-medium">
                  <span className="text-zinc-500">العملات الإضافية (البونص):</span>
                  <span className="text-emerald-400 font-extrabold">+{selectedPackage.bonusCoins} عملة</span>
                </div>
              )}
              <div className="flex justify-between font-medium pt-2 border-t border-white/5">
                <span className="text-zinc-400">إجمالي السعر:</span>
                <span className="text-amber-500 font-extrabold text-sm">${selectedPackage.price.toFixed(2)} USD</span>
              </div>
            </div>
            
            <PayPalScriptProvider options={{ clientId: "test", currency: selectedPackage.currency || "USD" }}>
              <PayPalButtons 
                style={{ layout: "vertical", color: "gold", shape: "pill" }}
                createOrder={(data, actions) => {
                  return actions.order.create({
                    intent: "CAPTURE",
                    purchase_units: [
                      {
                        amount: {
                          currency_code: selectedPackage.currency || "USD",
                          value: selectedPackage.price.toString(),
                        },
                        description: `شحن ${selectedPackage.coins + (selectedPackage.bonusCoins || 0)} Coins`,
                      },
                    ],
                  });
                }}
                onApprove={(data, actions) => {
                  return actions.order!.capture().then((details) => {
                    handlePurchaseCoins(selectedPackage.coins + (selectedPackage.bonusCoins || 0), selectedPackage.price);
                  });
                }}
                onError={(err) => {
                  console.error("PayPal Checkout onError", err);
                  alert("خطأ أثناء معالجة تفاصيل الشراء.");
                }}
              />
            </PayPalScriptProvider>
          </div>
        </div>
      )}
    </div>
  );
};
