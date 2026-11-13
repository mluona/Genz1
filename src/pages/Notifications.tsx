import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { Bell, BellRing, BookOpen, Check, Trash2, Clock, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import { formatRelativeArabicDate } from '../utils/dateUtils';
import { getProxiedImageUrl } from '../utils/imageUtils';
import { Series, Chapter } from '../types';

interface NotificationItem {
  id: string;
  seriesId: string;
  seriesTitle: string;
  seriesCover: string;
  seriesSlug: string;
  chapterNumber: number;
  chapterTitle?: string;
  publishDate: string;
  read: boolean;
}

export const Notifications: React.FC = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubscribedNotifications();
  }, [user, profile]);

  const fetchSubscribedNotifications = async () => {
    setLoading(true);
    try {
      // 1. Get subscribed or favorited series IDs
      let subscribedIds: string[] = [];
      if (profile) {
        const profileSubs = (profile as any)?.subscribedSeries || [];
        const profileFavs = profile.favorites || [];
        subscribedIds = Array.from(new Set([...profileSubs, ...profileFavs]));
      }

      // Also check localStorage for local subscriptions
      if (user) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`sub_${user.id}_`) && localStorage.getItem(key) === 'true') {
            const sid = key.replace(`sub_${user.id}_`, '');
            if (!subscribedIds.includes(sid)) {
              subscribedIds.push(sid);
            }
          }
        }
      }

      if (subscribedIds.length === 0) {
        // Fetch latest general updates as recommended notifications
        const { data: recentSeries } = await supabase
          .from('series')
          .select('id')
          .limit(5);
        if (recentSeries) {
          subscribedIds = recentSeries.map(s => s.id);
        }
      }

      if (subscribedIds.length === 0) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      // 2. Fetch series & latest chapters for those series
      const { data: seriesList } = await supabase
        .from('series')
        .select('id, title, coverImage, slug')
        .in('id', subscribedIds);

      if (!seriesList || seriesList.length === 0) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      interface SeriesMeta { id: string; title: string; coverImage: string; slug: string }
      const seriesMap = new Map<string, SeriesMeta>(
        (seriesList as SeriesMeta[]).map(s => [s.id, s])
      );

      const { data: chaptersList } = await supabase
        .from('chapters')
        .select('id, seriesId, chapterNumber, title, publishDate')
        .in('seriesId', subscribedIds)
        .order('publishDate', { ascending: false })
        .limit(30);

      if (!chaptersList) {
        setNotifications([]);
        setLoading(false);
        return;
      }

      const readIds = new Set(JSON.parse(localStorage.getItem(`read_notifications_${user?.id || 'guest'}`) || '[]'));

      const items: NotificationItem[] = chaptersList.map(ch => {
        const s = seriesMap.get(ch.seriesId);
        return {
          id: ch.id,
          seriesId: ch.seriesId,
          seriesTitle: s?.title || 'عمل جديد',
          seriesCover: s?.coverImage || '',
          seriesSlug: s?.slug || '',
          chapterNumber: ch.chapterNumber,
          chapterTitle: ch.title,
          publishDate: ch.publishDate,
          read: readIds.has(ch.id)
        };
      });

      setNotifications(items);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    localStorage.setItem(`read_notifications_${user?.id || 'guest'}`, JSON.stringify(allIds));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const readIds: string[] = JSON.parse(localStorage.getItem(`read_notifications_${user?.id || 'guest'}`) || '[]');
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem(`read_notifications_${user?.id || 'guest'}`, JSON.stringify(readIds));
    }
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-white/5 text-zinc-400 hover:text-white transition-all"
            title="رجوع"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <BellRing className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2">
              مركز الإشعارات
              {unreadCount > 0 && (
                <span className="px-2.5 py-0.5 bg-emerald-500 text-black text-xs font-black rounded-full">
                  {unreadCount} جديد
                </span>
              )}
            </h1>
            <p className="text-xs text-zinc-400 mt-1">
              تنبيهات الفصول الجديدة للأعمال المفضلة والمشترك بها
            </p>
          </div>
        </div>

        {notifications.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 rounded-xl border border-white/5 transition-all flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>تحديد الكل كُمقروء</span>
            </button>
            <button
              onClick={clearAllNotifications}
              className="p-2 bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-xl border border-white/5 transition-all"
              title="مسح القائمة"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-500">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-sm font-bold">جاري تحميل الإشعارات...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="glass-panel p-12 rounded-[2rem] text-center space-y-4 border border-white/5 max-w-md mx-auto my-12">
          <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-500 border border-white/5">
            <Bell className="w-8 h-8 opacity-40" />
          </div>
          <h3 className="text-lg font-black text-white">لا توجد إشعارات حالياً</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            قم بتفعيل زر التنبيه 🔔 في صفحة أي عمل ليصلك إشعار فوري عند صدور أي فصل جديد.
          </p>
          <Link
            to="/library"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all mt-2"
          >
            <BookOpen className="w-4 h-4" />
            <span>تصفح المكتبة</span>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                markAsRead(item.id);
                navigate(`/series/${item.seriesSlug}/${item.chapterNumber}`);
              }}
              className={`p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer group ${
                item.read 
                  ? 'bg-zinc-900/30 border-white/5 opacity-75 hover:opacity-100 hover:bg-zinc-900/60' 
                  : 'bg-emerald-500/[0.04] border-emerald-500/30 hover:bg-emerald-500/[0.08] shadow-lg shadow-emerald-500/5'
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={getProxiedImageUrl(item.seriesCover)}
                    alt={item.seriesTitle}
                    className="w-12 h-16 object-cover rounded-xl border border-white/10 shadow-md group-hover:scale-105 transition-transform"
                  />
                  {!item.read && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse" />
                  )}
                </div>

                <div className="space-y-1 text-right min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                      فصل جديد #{item.chapterNumber}
                    </span>
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatRelativeArabicDate(item.publishDate)}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white truncate group-hover:text-emerald-300 transition-colors">
                    {item.seriesTitle}
                  </h4>
                  {item.chapterTitle && (
                    <p className="text-xs text-zinc-400 truncate">
                      {item.chapterTitle}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-black text-xs font-black rounded-xl group-hover:scale-105 transition-transform">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>قراءة</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
