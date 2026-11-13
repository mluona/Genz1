import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import CommentsSection from '../components/CommentsSection';
import {
  Star,
  Eye,
  Share2,
  ChevronRight,
  Lock,
  Unlock,
  Tag,
  Bell,
  BellRing,
  Check,
  Bookmark,
  Play,
  ArrowUpDown,
  Search,
  ChevronDown,
  PenLine,
  Palette,
  Layers,
  MoreHorizontal,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { formatRelativeArabicDate } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Series, Chapter } from '../types';
import { getProxiedImageUrl } from '../utils/imageUtils';
import { LoginModal } from '../components/LoginModal';
import { SeriesCard } from '../components/SeriesCard';

const GENRE_TRANSLATIONS: Record<string, string> = {
  'Action': 'أكشن', 'Adventure': 'مغامرة', 'Comedy': 'كوميدي', 'Drama': 'دراما', 'Fantasy': 'خيالي',
  'Horror': 'رعب', 'Mystery': 'غموض', 'Psychological': 'نفسي', 'Romance': 'رومانسي',
  'Sci-Fi': 'خيال علمي', 'Slice of Life': 'شريحة من الحياة', 'Sports': 'رياضي', 'Supernatural': 'قوى خارقة', 'Thriller': 'إثارة',
  'Chinese': 'صينية', 'Korean': 'كورية', 'Japanese': 'يابانية', 'Magic': 'سحر', 'Time Travel': 'إعادة زمن', 'Isekai': 'ايسكاي',
  'Martial Arts': 'فنون قتالية', 'Reincarnation': 'إعادة تجسيد', 'Cultivation': 'زراعة قوى', 'Video Games': 'ألعاب فيديو',
  'Leveling': 'تطوير المستوى', 'System': 'نظام', 'Academy': 'أكاديمية', 'Tower': 'برج', 'Dungeons': 'دهاليز'
};

export const SeriesDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [series, setSeries] = useState<Series | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chapters' | 'comments'>('chapters');
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [similarWorks, setSimilarWorks] = useState<Series[]>([]);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedStars, setSelectedStars] = useState(5);
  const [hoveredStars, setHoveredStars] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);

  // Story & chapter UX states
  const [isSynopsisExpanded, setIsSynopsisExpanded] = useState(false);
  const [chapterSearch, setChapterSearch] = useState('');
  const [chapterSort, setChapterSort] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    if (series) {
      const rated = localStorage.getItem(`hasRated_${series.id}`);
      if (rated) {
        setHasRated(true);
      }
    }
  }, [series]);

  const handleRatingSubmit = async () => {
    if (!series) return;
    if (hasRated) {
      showToast("لقد قمت بتقييم هذا العمل بالفعل!");
      setIsRatingModalOpen(false);
      return;
    }

    const starsToSubmit = selectedStars;
    const currentRating = series.rating || 5;
    const currentCount = series.ratingCount || 1;
    const currentTotal = currentRating * currentCount;
    const newCount = currentCount + 1;
    const newAverage = (currentTotal + starsToSubmit) / newCount;

    try {
      const { error } = await supabase
        .from('series')
        .update({
          rating: newAverage,
          ratingCount: newCount
        })
        .eq('id', series.id);

      if (error) throw error;

      setSeries({
        ...series,
        rating: newAverage,
        ratingCount: newCount
      });
      setHasRated(true);
      localStorage.setItem(`hasRated_${series.id}`, 'true');
      showToast("شكراً لك على تقييمك!");
    } catch (err) {
      console.error("Error submitting rating:", err);
      showToast("فشل إرسال التقييم");
    } finally {
      setIsRatingModalOpen(false);
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    if (series) {
      if (profile) {
        setIsFavorite(profile.favorites?.includes(series.id) || false);
        const profileSubs = (profile as any)?.subscribedSeries || [];
        const localSub = localStorage.getItem(`sub_${user?.id || 'guest'}_${series.id}`) === 'true';
        setIsSubscribed(profileSubs.includes(series.id) || localSub);
      } else {
        const localSub = localStorage.getItem(`sub_guest_${series.id}`) === 'true';
        setIsSubscribed(localSub);
      }
    }
  }, [profile, series, user]);

  const toggleNotificationSubscription = async () => {
    if (!series) return;

    if (!user) {
      setIsLoginModalOpen(true);
      showToast("الرجاء تسجيل الدخول لتفعيل تنبيهات الفصول الجديدة");
      return;
    }

    const nextState = !isSubscribed;
    setIsSubscribed(nextState);
    localStorage.setItem(`sub_${user.id}_${series.id}`, nextState ? 'true' : 'false');

    let currentSubscribedSeries: string[] = (profile as any)?.subscribedSeries || [];
    if (nextState) {
      if (!currentSubscribedSeries.includes(series.id)) {
        currentSubscribedSeries = [...currentSubscribedSeries, series.id];
      }
    } else {
      currentSubscribedSeries = currentSubscribedSeries.filter(id => id !== series.id);
    }

    try {
      await supabase
        .from('profiles')
        .update({ subscribedSeries: currentSubscribedSeries })
        .eq('id', user.id);

      await refreshProfile(user.id);
      showToast(nextState
        ? "تم تفعيل التنبيهات! ستصلك إشعارات فورية عند تنزيل فصل جديد."
        : "تم إلغاء تفعيل التنبيهات لهذا العمل."
      );
    } catch (error) {
      console.error('Error updating notification subscription:', error);
      showToast(nextState
        ? "تم تفعيل التنبيهات لهذا العمل!"
        : "تم إلغاء تفعيل التنبيهات لهذا العمل."
      );
    }
  };

  const toggleFavorite = async () => {
    if (!user || !series || !profile) {
      setIsLoginModalOpen(true);
      showToast("الرجاء تسجيل الدخول للإضافة إلى المكتبة");
      return;
    }

    const wasFavorite = isFavorite;
    setIsFavorite(!wasFavorite);

    let newFavorites = [...(profile.favorites || [])];
    if (wasFavorite) {
      newFavorites = newFavorites.filter(id => id !== series.id);
    } else {
      newFavorites.push(series.id);
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ favorites: newFavorites })
        .eq('id', user.id);

      if (error) throw error;
      showToast(wasFavorite ? "تمت الإزالة من المكتبة" : "تمت الإضافة للمكتبة");
      await refreshProfile(user.id);
    } catch (error: any) {
      console.error('Error updating favorites:', error);
      setIsFavorite(wasFavorite);
      showToast("فشلت الإضافة إلى المكتبة");
    }
  };

  const handleShare = async () => {
    const shareText = `اقرأ ${series?.title || ''} على GENZ`;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: series?.title || 'GENZ',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    const text = window.location.href;
    try {
      if (document.hasFocus()) {
        await navigator.clipboard.writeText(text);
        showToast('تم نسخ رابط العمل!');
      } else {
        throw new Error("Document not focused");
      }
    } catch (err) {
      console.warn('Navigator clipboard failed, trying fallback', err);
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showToast('تم نسخ رابط العمل!');
      } catch (fallbackErr) {
        console.error('Fallback clipboard failed', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const readChapterIds = React.useMemo(() => {
    const ids = new Set<string>();
    if (!series) return ids;

    if (profile && (profile as any).readChapters) {
      ((profile as any).readChapters as string[]).forEach(id => ids.add(id));
    }

    if (profile && profile.history) {
      profile.history.forEach(h => {
        if (h.seriesId === series.id && h.lastChapterId) {
          ids.add(h.lastChapterId);
        }
      });
    }

    try {
      const userKey = `read_chapters_${user?.id || 'guest'}`;
      const localRead: string[] = JSON.parse(localStorage.getItem(userKey) || '[]');
      localRead.forEach(id => ids.add(id));

      const guestRead: string[] = JSON.parse(localStorage.getItem('read_chapters_guest') || '[]');
      guestRead.forEach(id => ids.add(id));
    } catch (e) {}

    return ids;
  }, [series, profile, user]);

  const lastReadChapterId = React.useMemo(() => {
    if (!series) return null;

    if (profile && profile.history) {
      const hist = profile.history.find(h => h.seriesId === series.id);
      if (hist?.lastChapterId) return hist.lastChapterId;
    }

    try {
      const localLast = localStorage.getItem(`last_read_${series.id}`);
      if (localLast) return localLast;
    } catch (e) {}

    return null;
  }, [series, profile]);

  const lastReadChapter = React.useMemo(() => {
    if (!lastReadChapterId || chapters.length === 0) return null;
    return chapters.find(c => c.id === lastReadChapterId) || null;
  }, [lastReadChapterId, chapters]);

  const filteredAndSortedChapters = React.useMemo(() => {
    const q = chapterSearch.trim().toLowerCase();
    const list = q
      ? chapters.filter((ch) => {
          const numStr = String(ch.chapterNumber);
          const titleStr = (ch.title || '').toLowerCase();
          return numStr.includes(q) || titleStr.includes(q);
        })
      : [...chapters];

    list.sort((a, b) =>
      chapterSort === 'desc'
        ? b.chapterNumber - a.chapterNumber
        : a.chapterNumber - b.chapterNumber
    );

    return list;
  }, [chapters, chapterSearch, chapterSort]);

  const readCountInSeries = React.useMemo(() => {
    if (chapters.length === 0 || readChapterIds.size === 0) return 0;
    return chapters.filter((ch) => readChapterIds.has(ch.id)).length;
  }, [chapters, readChapterIds]);

  useEffect(() => {
    if (!slug) return;

    const fetchSeries = async () => {
      try {
        const { data, error } = await supabase
          .from('series')
          .select('*')
          .eq('slug', slug)
          .single();

        if (error) throw error;
        setSeries(data as Series);
      } catch (error) {
        console.error('Error fetching series:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();

    const channel = supabase
      .channel(`series_${slug}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'series', filter: `slug=eq.${slug}` }, (payload) => {
        setSeries(payload.new as Series);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug]);

  useEffect(() => {
    if (!series) return;

    const fetchChaptersAndComments = async () => {
      try {
        const { data: chaptersData } = await supabase
          .from('chapters')
          .select('id, seriesId, chapterNumber, title, publishDate, isPremium, coinPrice, views')
          .eq('seriesId', series.id)
          .order('chapterNumber', { ascending: false });

        if (chaptersData) setChapters(chaptersData as Chapter[]);

        const { count } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true })
          .eq('seriesId', series.id)
          .is('chapterId', null);

        setCommentsCount(count || 0);
      } catch (error) {
        console.error('Error fetching chapters/comments:', error);
      }
    };

    const fetchSimilarWorks = async () => {
      try {
        const { data } = await supabase
          .from('series')
          .select('id, title, coverImage, type, author, genres, rating, ratingCount, slug, status, description')
          .neq('id', series.id)
          .limit(100);

        if (data) {
          const filtered = (data as Series[])
            .filter(item => item.id !== series.id)
            .map(item => {
              let score = 0;

              const genreOverlap = item.genres.filter(g => series.genres.includes(g)).length;
              score += genreOverlap * 5;

              if (item.author && series.author && item.author === series.author) {
                score += 10;
              }

              if (item.title && series.title) {
                const titleWords = series.title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
                const itemTitleLower = item.title.toLowerCase();
                const titleMatch = titleWords.filter(w => itemTitleLower.includes(w)).length;
                score += titleMatch * 3;
              }

              if (item.description && series.description) {
                const descWords = series.description.toLowerCase().split(/\s+/).filter(w => w.length > 4);
                const itemDescLower = item.description.toLowerCase();
                const descMatch = descWords.filter(w => itemDescLower.includes(w)).length;
                score += descMatch * 1;
              }

              if (score === 0) {
                score = Math.random() * 0.1;
              }

              return { item, score };
            })
            .sort((a, b) => b.score - a.score)
            .map(x => x.item)
            .slice(0, 10);

          setSimilarWorks(filtered);
        }
      } catch (error) {
        console.error('Error fetching similar works:', error);
      }
    };

    fetchChaptersAndComments();
    fetchSimilarWorks();

    const chaptersChannel = supabase
      .channel(`chapters_${series.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'chapters', filter: `seriesId=eq.${series.id}` }, () => {
        fetchChaptersAndComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(chaptersChannel);
    };
  }, [series]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!series) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-lg font-bold text-zinc-300">لم يتم العثور على العمل المطلوب</p>
        <Link
          to="/"
          className="px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-bold hover:bg-emerald-400 transition-colors"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const statusLabel =
    series.status === 'Ongoing'
      ? 'مستمر'
      : series.status === 'Completed'
      ? 'مكتمل'
      : series.status === 'Hiatus'
      ? 'متوقف مؤقتاً'
      : series.status === 'Dropped'
      ? 'متوقف'
      : series.status;

  const descriptionText = series.description?.trim() || '';
  const isLongSynopsis = descriptionText.length > 280;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 selection:bg-emerald-500 selection:text-black relative overflow-x-hidden">
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      {/* Top Series Overview Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-start">
          {/* Clean Portrait Cover */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-4 w-full max-w-[340px] mx-auto lg:max-w-none"
          >
            <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900">
              <img
                src={getProxiedImageUrl(series.coverImage)}
                alt={series.title}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </motion.div>

          {/* Info, Actions, Metadata Chips & Synopsis */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-8 space-y-5 text-right min-w-0"
          >
            {/* Unboxed Comma-Separated Genres */}
            {series.genres && series.genres.length > 0 && (
              <div className="text-sm font-medium text-zinc-400 leading-relaxed">
                {series.genres.map((genre, index) => (
                  <React.Fragment key={genre}>
                    <Link
                      to={`/library?genre=${encodeURIComponent(genre)}`}
                      className="hover:text-emerald-400 transition-colors"
                    >
                      {GENRE_TRANSLATIONS[genre] || genre}
                    </Link>
                    {index < series.genres.length - 1 && <span>، </span>}
                  </React.Fragment>
                ))}
              </div>
            )}

            {/* Series Title */}
            <h1
              className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight text-balance"
              dir="auto"
            >
              {series.title}
            </h1>

            {/* Primary & Secondary Action Stack */}
            <div className="space-y-3 pt-1">
              {/* Row 1: Add to Library Pill + Bell Button + Share Button */}
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={toggleFavorite}
                  className={`flex-1 min-h-[48px] px-5 py-3 rounded-full text-sm font-bold transition-colors flex items-center justify-between gap-3 cursor-pointer border ${
                    isFavorite
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                      : 'bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/10'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    <span>{isFavorite ? 'في المكتبة' : 'أضف للمكتبة'}</span>
                  </span>
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                </button>

                <button
                  type="button"
                  onClick={toggleNotificationSubscription}
                  aria-label={isSubscribed ? 'إلغاء تفعيل التنبيهات' : 'تفعيل التنبيه عند نزول فصل جديد'}
                  title={isSubscribed ? 'إلغاء تفعيل التنبيهات' : 'تفعيل التنبيه عند نزول فصل جديد'}
                  className={`w-12 h-12 rounded-2xl transition-colors flex items-center justify-center cursor-pointer shrink-0 border ${
                    isSubscribed
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                      : 'bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white border-white/10'
                  }`}
                >
                  {isSubscribed ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                </button>

                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="مشاركة العمل"
                  title="مشاركة العمل"
                  className="w-12 h-12 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-zinc-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Row 2: Full-Width Start / Continue Reading Pill */}
              <button
                type="button"
                disabled={chapters.length === 0}
                onClick={() => {
                  if (chapters.length === 0) return;
                  if (lastReadChapter) {
                    navigate(`/series/${series.slug}/${lastReadChapter.chapterNumber}`);
                  } else {
                    const firstChapter = chapters[chapters.length - 1];
                    navigate(`/series/${series.slug}/${firstChapter.chapterNumber}`);
                  }
                }}
                className="w-full min-h-[48px] px-6 py-3 rounded-full bg-white/[0.07] hover:bg-emerald-500 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 hover:border-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>
                  {lastReadChapter
                    ? `متابعة القراءة · الفصل ${lastReadChapter.chapterNumber}`
                    : chapters.length > 0
                    ? 'ابدأ القراءة'
                    : 'لا توجد فصول بعد'}
                </span>
              </button>
            </div>

            {/* Labeled Metadata Chips Grid */}
            <div className="flex flex-wrap items-start gap-x-4 gap-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white">
                  <PenLine className="w-3.5 h-3.5 text-zinc-300" />
                  <span>الكاتب</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-white/[0.07] border border-white/[0.08] text-xs sm:text-sm font-semibold text-zinc-200 max-w-[180px] truncate">
                  {series.author || 'غير محدد'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white">
                  <Palette className="w-3.5 h-3.5 text-zinc-300" />
                  <span>المترجم</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-white/[0.07] border border-white/[0.08] text-xs sm:text-sm font-semibold text-zinc-200 max-w-[180px] truncate">
                  {series.artist || 'غير محدد'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white">
                  <Layers className="w-3.5 h-3.5 text-zinc-300" />
                  <span>النوع</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-white/[0.07] border border-white/[0.08] text-xs sm:text-sm font-semibold text-zinc-200">
                  {series.type === 'Novel' ? 'رواية' : series.type}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white">
                  <MoreHorizontal className="w-3.5 h-3.5 text-zinc-300" />
                  <span>الحالة</span>
                </div>
                <div
                  className={`px-3.5 py-2 rounded-xl bg-white/[0.07] border border-white/[0.08] text-xs sm:text-sm font-semibold ${
                    series.status === 'Ongoing' ? 'text-emerald-400' : 'text-zinc-200'
                  }`}
                >
                  {statusLabel}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white">
                  <Star className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
                  <span>التقييم</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsRatingModalOpen(true)}
                  title="اضغط لتقييم العمل"
                  className="px-3.5 py-2 rounded-xl bg-white/[0.07] hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-500/40 text-xs sm:text-sm font-semibold text-zinc-200 tabular-nums transition-colors cursor-pointer"
                >
                  {series.rating.toFixed(1)} ({series.ratingCount})
                </button>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white">
                  <Eye className="w-3.5 h-3.5 text-zinc-300" />
                  <span>المشاهدات</span>
                </div>
                <div className="px-3.5 py-2 rounded-xl bg-white/[0.07] border border-white/[0.08] text-xs sm:text-sm font-semibold text-zinc-200 tabular-nums">
                  {series.views.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Synopsis (القصة) with Fade Gradient + Centered Expand Pill */}
            <section className="pt-2 space-y-3 text-right">
              <h2 className="text-xl font-black text-white tracking-tight">القصة</h2>

              {descriptionText ? (
                <div className="relative">
                  <p
                    className={`text-sm sm:text-[15px] leading-[1.85] text-zinc-300 whitespace-pre-line ${
                      isLongSynopsis && !isSynopsisExpanded ? 'line-clamp-4 pb-6' : ''
                    }`}
                    dir="auto"
                  >
                    {descriptionText}
                  </p>

                  {isLongSynopsis && !isSynopsisExpanded && (
                    <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent flex items-end justify-center pt-4">
                      <button
                        type="button"
                        onClick={() => setIsSynopsisExpanded(true)}
                        className="px-4 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-xs font-bold text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer backdrop-blur-sm"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                        <span>توسيع</span>
                      </button>
                    </div>
                  )}

                  {isLongSynopsis && isSynopsisExpanded && (
                    <div className="mt-3 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setIsSynopsisExpanded(false)}
                        className="px-4 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-xs font-bold text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                        <span>تقليص</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">لا يوجد وصف متاح لهذا العمل حالياً.</p>
              )}
            </section>

            {/* Tags */}
            {series.tags && series.tags.length > 0 && (
              <div className="pt-1 flex items-center flex-wrap gap-1.5">
                <Tag className="w-3.5 h-3.5 text-zinc-500 ml-1" />
                {series.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] text-zinc-300 rounded-lg text-xs font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Chapters & Comments Section */}
        <section className="mt-10 space-y-6">
          {/* Segmented Tab Bar */}
          <div className="flex items-center justify-between border-b border-white/[0.07] gap-4">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('chapters')}
                className={`px-5 py-3.5 text-sm font-bold transition-colors relative cursor-pointer whitespace-nowrap ${
                  activeTab === 'chapters' ? 'text-white' : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                <span>الفصول</span>
                <span className="mr-1.5 text-xs text-zinc-400 tabular-nums">({chapters.length})</span>
                {activeTab === 'chapters' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('comments')}
                className={`px-5 py-3.5 text-sm font-bold transition-colors relative cursor-pointer whitespace-nowrap ${
                  activeTab === 'comments' ? 'text-white' : 'text-zinc-500 hover:text-zinc-200'
                }`}
              >
                <span>التعليقات</span>
                <span className="mr-1.5 text-xs text-zinc-400 tabular-nums">({commentsCount})</span>
                {activeTab === 'comments' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>
            </div>

            {activeTab === 'chapters' && readCountInSeries > 0 && (
              <span className="text-xs text-zinc-400 tabular-nums hidden sm:inline">
                قرأت {readCountInSeries} من {chapters.length}
              </span>
            )}
          </div>

          {activeTab === 'chapters' ? (
            <div className="space-y-4">
              {/* Chapter Search & Sort Controls */}
              {chapters.length > 0 && (
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={chapterSearch}
                      onChange={(e) => setChapterSearch(e.target.value)}
                      placeholder="ابحث برقم الفصل أو العنوان..."
                      className="w-full min-h-[42px] bg-zinc-900/60 border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pr-10 pl-4 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-colors text-right"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => setChapterSort((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                    className="min-h-[42px] px-4 py-2 bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/[0.08] rounded-xl text-xs font-bold text-zinc-200 flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{chapterSort === 'desc' ? 'الأحدث أولاً' : 'الأقدم أولاً'}</span>
                  </button>
                </div>
              )}

              {/* Structured Chapter List */}
              {filteredAndSortedChapters.length > 0 ? (
                <div className="bg-zinc-900/35 border border-white/[0.07] rounded-2xl divide-y divide-white/[0.06] overflow-hidden">
                  {filteredAndSortedChapters.map((chapter) => {
                    const isRead = readChapterIds.has(chapter.id);
                    const isLastRead = lastReadChapterId === chapter.id;

                    return (
                      <div
                        key={chapter.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => navigate(`/series/${series.slug}/${chapter.chapterNumber}`)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            navigate(`/series/${series.slug}/${chapter.chapterNumber}`);
                          }
                        }}
                        className={`group px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                          isLastRead
                            ? 'bg-amber-500/[0.07] hover:bg-amber-500/[0.11]'
                            : isRead
                            ? 'bg-emerald-500/[0.02] hover:bg-white/[0.04]'
                            : 'hover:bg-white/[0.04]'
                        }`}
                      >
                        <div className="flex items-center gap-3.5 sm:gap-4 min-w-0">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold tabular-nums shrink-0 transition-colors ${
                              isLastRead
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                                : isRead
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                                : 'bg-zinc-950/80 text-zinc-400 border border-white/[0.06] group-hover:text-emerald-400'
                            }`}
                          >
                            {chapter.chapterNumber}
                          </div>

                          <div className="min-w-0 text-right" dir="auto">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3
                                className={`text-sm sm:text-[15px] font-semibold truncate transition-colors ${
                                  isLastRead
                                    ? 'text-amber-200 group-hover:text-amber-300'
                                    : isRead
                                    ? 'text-zinc-300 group-hover:text-emerald-400'
                                    : 'text-zinc-100 group-hover:text-emerald-400'
                                }`}
                              >
                                {chapter.title || `الفصل ${chapter.chapterNumber}`}
                              </h3>

                              {isLastRead ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                                  <Bookmark className="w-3 h-3 fill-amber-400" />
                                  <span>توقفت هنا</span>
                                </span>
                              ) : isRead ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
                                  <Check className="w-3 h-3" />
                                  <span>مقروء</span>
                                </span>
                              ) : null}
                            </div>

                            <p className="text-xs text-zinc-500 mt-0.5">
                              {formatRelativeArabicDate(chapter.publishDate)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {chapter.isPremium && (
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-bold tabular-nums ${
                                profile?.unlockedChapters?.includes(chapter.id)
                                  ? 'text-emerald-400'
                                  : 'text-amber-400'
                              }`}
                            >
                              {profile?.unlockedChapters?.includes(chapter.id) ? (
                                <Unlock className="w-3.5 h-3.5" />
                              ) : (
                                <Lock className="w-3.5 h-3.5" />
                              )}
                              <span>{chapter.coinPrice}</span>
                            </span>
                          )}

                          <ChevronRight
                            className={`w-4 h-4 transform rotate-180 group-hover:-translate-x-0.5 transition-all ${
                              isLastRead
                                ? 'text-amber-400'
                                : isRead
                                ? 'text-emerald-400'
                                : 'text-zinc-600 group-hover:text-emerald-400'
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-zinc-900/35 border border-white/[0.07] rounded-2xl py-12 px-6 text-center text-sm text-zinc-500">
                  {chapterSearch.trim()
                    ? 'لا توجد فصول مطابقة لبحثك'
                    : 'لم يتم نشر فصول لهذا العمل بعد'}
                </div>
              )}
            </div>
          ) : (
            <CommentsSection seriesId={series.id} isAdmin={profile?.role === 'admin'} />
          )}
        </section>
      </div>

      {/* Similar Works Section */}
      {similarWorks.length > 0 && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-10 border-t border-white/[0.06] space-y-6 text-right">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">أعمال مشابهة قد تعجبك</h2>
              <p className="text-xs text-zinc-500 mt-1">مقترحات بناءً على التصنيف، الكاتب، والقصة</p>
            </div>
          </div>

          <div className="flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-3.5 sm:gap-4 snap-x snap-mandatory hide-scrollbar">
            {similarWorks.map((work) => (
              <div
                key={work.id}
                className="w-[115px] sm:w-[135px] md:w-[145px] lg:w-[155px] transition-transform duration-200 hover:-translate-y-1 snap-start shrink-0"
              >
                <SeriesCard series={work} size="small" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Rating Modal */}
      <AnimatePresence>
        {isRatingModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="bg-zinc-950 w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 text-center"
            >
              <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <Star className="w-7 h-7 fill-emerald-400 text-emerald-400" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-bold text-white">تقييم العمل</h3>
                <p className="text-zinc-400 text-sm">ما هو تقييمك لـ "{series.title}"؟</p>
              </div>

              {/* Stars selection */}
              <div className="flex justify-center items-center gap-2.5 py-2" dir="ltr">
                {[1, 2, 3, 4, 5].map((starsVal) => {
                  const isHoveredOrSelected = (hoveredStars !== null ? hoveredStars : selectedStars) >= starsVal;
                  return (
                    <button
                      key={starsVal}
                      type="button"
                      onMouseEnter={() => setHoveredStars(starsVal)}
                      onMouseLeave={() => setHoveredStars(null)}
                      onClick={() => setSelectedStars(starsVal)}
                      className="p-1.5 transition-transform active:scale-95 hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-9 h-9 transition-colors duration-150 ${
                          isHoveredOrSelected
                            ? 'text-emerald-400 fill-emerald-400'
                            : 'text-zinc-700 fill-transparent'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="text-xs font-semibold text-zinc-400 tabular-nums">
                {selectedStars} من أصل 5 نجوم
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleRatingSubmit}
                  className="flex-1 min-h-[44px] py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors cursor-pointer"
                >
                  إرسال التقييم
                </button>
                <button
                  type="button"
                  onClick={() => setIsRatingModalOpen(false)}
                  className="flex-1 min-h-[44px] py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold rounded-xl transition-colors border border-white/10 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast Message */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 24, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 24, x: '-50%' }}
            className="fixed bottom-6 left-1/2 z-[100] px-5 py-2.5 bg-zinc-900 border border-white/10 text-white rounded-full shadow-2xl font-semibold text-sm whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

