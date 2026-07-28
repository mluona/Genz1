import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabase';
import CommentsSection from '../components/CommentsSection';
import { Star, Eye, Clock, List, MessageSquare, Heart, Share2, BookOpen, ChevronRight, User, Calendar, Lock, Unlock, Coins, Paintbrush, Tag, Activity, Info, Languages } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { formatRelativeArabicDate } from '../utils/dateUtils';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Series, Chapter } from '../types';
import { getProxiedImageUrl } from '../utils/imageUtils';
import { LoginModal } from '../components/LoginModal';
import { SeriesCard } from '../components/SeriesCard';
import { Sparkles } from 'lucide-react';

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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [similarWorks, setSimilarWorks] = useState<Series[]>([]);
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [selectedStars, setSelectedStars] = useState(5);
  const [hoveredStars, setHoveredStars] = useState<number | null>(null);
  const [hasRated, setHasRated] = useState(false);

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
    if (profile && series) {
      setIsFavorite(profile.favorites?.includes(series.id) || false);
    }
  }, [profile, series]);

  const toggleFavorite = async () => {
    if (!user || !series || !profile) {
      showToast("الرجاء تسجيل الدخول للإضافة إلى المكتبة");
      return;
    }
    
    // Optimistic Update
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
        .eq('id', user.id); // Changed from .eq('uid', user.id) to .eq('id', user.id) based on Profile.tsx usage
      
      if (error) throw error;
      showToast(wasFavorite ? "تمت الإزالة من المكتبة" : "تمت الإضافة للمكتبة");
      await refreshProfile(user.id); // Update auth context profile data
    } catch (error: any) {
      console.error('Error updating favorites:', error);
      setIsFavorite(wasFavorite); // Revert
      showToast("فشلت الإضافة إلى المكتبة");
    }
  };

  const handleShare = async () => {
    const shareText = "شاهد أفضل الروايات على";
    const shareUrl = "https://genzmanhw.vercel.app/";
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GENZ',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.error('Error sharing:', err);
        // Fallback to copy
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = async () => {
    const text = "شاهد أفضل الروايات على https://genzmanhw.vercel.app/";
    try {
      if (document.hasFocus()) {
        await navigator.clipboard.writeText(text);
        showToast('تم نسخ الرابط!');
      } else {
        throw new Error("Document not focused");
      }
    } catch (err) {
      console.warn('Navigator clipboard failed, trying fallback', err);
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showToast('تم نسخ الرابط!');
      } catch (fallbackErr) {
        console.error('Fallback clipboard failed', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleLogin = () => {
    setIsLoginModalOpen(true);
  };

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

    // Real-time subscription
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
        // Fetch only required lightweight fields to drastically improve performance
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
              
              // 1. Genre overlap (High Weight)
              const genreOverlap = item.genres.filter(g => series.genres.includes(g)).length;
              score += genreOverlap * 5;
              
              // 2. Author match (Very High Weight)
              if (item.author && series.author && item.author === series.author) {
                score += 10;
              }
              
              // 3. Title overlap (Medium Weight)
              if (item.title && series.title) {
                const titleWords = series.title.toLowerCase().split(/\s+/).filter(w => w.length > 2);
                const itemTitleLower = item.title.toLowerCase();
                const titleMatch = titleWords.filter(w => itemTitleLower.includes(w)).length;
                score += titleMatch * 3;
              }
              
              // 4. Description overlap (Low Weight)
              if (item.description && series.description) {
                const descWords = series.description.toLowerCase().split(/\s+/).filter(w => w.length > 4);
                const itemDescLower = item.description.toLowerCase();
                const descMatch = descWords.filter(w => itemDescLower.includes(w)).length;
                score += descMatch * 1;
              }
              
              // Optional: Just random score if no match to make sure something shows up!
              if (score === 0) {
                 score = Math.random() * 0.1; // fallback random score
              }

              return { item, score };
            })
            // Sort by score
            .sort((a, b) => b.score - a.score)
            .map(x => x.item)
            .slice(0, 10); // Show up to 10 similar ones, we can use a carousel or scroll
            
          setSimilarWorks(filtered);
        }
      } catch (error) {
        console.error('Error fetching similar works:', error);
      }
    };

    fetchChaptersAndComments();
    fetchSimilarWorks();

    // Real-time for chapters
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

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!series) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">لم يتم العثور على العمل</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 selection:bg-emerald-500 selection:text-black relative overflow-x-hidden">
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
      
      {/* Custom premium background & gradient atmosphere orbs */}
      <div className="atmosphere" />
      <div className="absolute inset-x-0 top-0 h-[1000px] bg-gradient-to-b from-emerald-500/3 to-transparent blur-[150px] pointer-events-none z-0" />
      <div className="absolute top-[25%] right-[-10%] w-[400px] h-[400px] bg-emerald-500/3 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.005)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.005)_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none z-0 [mask-image:radial-gradient(ellipse_at_top,white,transparent_80%)]" />
      
      {/* Immersive Header */}
      <div className="relative min-h-[60vh] lg:min-h-[70vh] flex flex-col justify-end overflow-hidden bg-zinc-950">
        {/* Background Cover */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 scale-100 transition-all duration-1000"
            style={{ backgroundImage: `url(${getProxiedImageUrl(series.backgroundImage || series.coverImage)})` }}
          />
          {/* Gentle elegant bottom gradient overlay to blend into the main content area */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent pointer-events-none" />
        </div>

        <div className="relative z-10 pt-32 pb-12 sm:pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-center md:items-end text-center md:text-left">
              {/* Cover Image Card */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="relative group shrink-0"
              >
                <div className="absolute -inset-1 bg-gradient-to-b from-emerald-500 to-blue-500 rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                <div className="relative w-40 sm:w-56 md:w-64 aspect-[2/3] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
                  <img
                    src={getProxiedImageUrl(series.coverImage)}
                    alt={series.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </motion.div>

              {/* Series Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="flex-1 space-y-4 md:space-y-6 flex flex-col items-center md:items-start text-center md:text-right w-full mt-4 md:mt-0"
              >
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-black rounded-full uppercase tracking-widest">
                    رواية
                  </span>
                  <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border ${
                    series.status === 'Ongoing' ? 'border-emerald-500/50 text-emerald-500' : 'border-zinc-500/50 text-zinc-500'
                  }`}>
                    {series.status === 'Ongoing' ? 'مستمر' : series.status === 'Completed' ? 'مكتمل' : series.status}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black tracking-tighter leading-tight text-white drop-shadow-xl" dir="auto">
                  {series.title}
                </h1>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-zinc-300 text-xs sm:text-sm font-medium w-full max-w-full">
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-lg shrink-0">
                    <Calendar className="w-4 h-4 text-emerald-400" />
                    <span>{series.releaseYear}</span>
                  </div>
                  <button 
                    onClick={() => setIsRatingModalOpen(true)}
                    className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-lg shrink-0 cursor-pointer hover:bg-emerald-500/10 hover:border-emerald-500/35 transition-all group"
                    title="اضغط لتقييم العمل"
                  >
                    <Star className="w-4 h-4 text-emerald-400 fill-emerald-400 group-hover:scale-110 transition-transform" />
                    <span className="text-white font-bold">{series.rating.toFixed(1)}</span>
                    <span className="opacity-50">({series.ratingCount})</span>
                  </button>
                  <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl px-4 py-2 rounded-full border border-white/10 shadow-lg shrink-0">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span className="truncate max-w-[100px] sm:max-w-xs">{series.author}</span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-2">
                  {series.genres.map(genre => (
                    <Link key={genre} to={`/library?genre=${encodeURIComponent(genre)}`} className="px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-white hover:bg-emerald-500 hover:border-emerald-500 hover:text-black transition-all cursor-pointer shadow-lg shrink-0">
                      {GENRE_TRANSLATIONS[genre] || genre}
                    </Link>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button
              onClick={() => chapters.length > 0 && navigate(`/series/${series.slug}/${chapters[chapters.length - 1].chapterNumber}`)}
              className="m3-button-primary flex-1 py-4 px-8 text-sm flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" /> ابدأ القراءة
            </button>
            <div className="flex gap-3 sm:gap-4">
              <button 
                onClick={toggleFavorite}
                className={`flex-1 sm:flex-none py-4 px-8 text-sm transition-all flex items-center justify-center gap-2 ${isFavorite ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 rounded-2xl font-black uppercase tracking-widest' : 'm3-button-secondary'}`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} /> 
                <span className="sm:hidden lg:inline">{isFavorite ? 'في المكتبة' : 'أضف للمكتبة'}</span>
              </button>
              <button 
                onClick={handleShare}
                className="p-4 bg-zinc-900 border border-white/5 rounded-2xl hover:bg-zinc-800 transition-colors flex items-center justify-center"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Synopsis (القصة) */}
          <section className="space-y-4 text-right">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3 justify-start">
              <div className="w-1 h-6 bg-emerald-500 rounded-full" />
              القصة
            </h2>
            <div className="glass-panel p-8 rounded-[2rem] leading-relaxed text-zinc-300" dir="auto">
              {series.description}
            </div>
          </section>

          {/* Tabs */}
          <section className="space-y-8">
            <div className="flex border-b border-white/5">
              <button
                onClick={() => setActiveTab('chapters')}
                className={`px-8 py-4 text-sm font-black uppercase tracking-widest transition-colors relative ${activeTab === 'chapters' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                الفصول ({chapters.length})
                {activeTab === 'chapters' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />}
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-8 py-4 text-sm font-black uppercase tracking-widest transition-colors relative ${activeTab === 'comments' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                التعليقات ({commentsCount})
                {activeTab === 'comments' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />}
              </button>
            </div>

            {activeTab === 'chapters' ? (
              <div className="space-y-3">
                {chapters.map((chapter, index) => (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => navigate(`/series/${series.slug}/${chapter.chapterNumber}`)}
                    className="group glass-panel p-5 rounded-2xl flex items-center justify-between hover:bg-zinc-800/50 transition-all cursor-pointer border-white/5 hover:border-emerald-500/30"
                  >
                    <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-zinc-950 rounded-xl flex items-center justify-center text-xs sm:text-sm font-black text-zinc-500 group-hover:text-emerald-500 transition-colors shrink-0">
                        {chapter.chapterNumber}
                      </div>
                      <div className="min-w-0 text-right" dir="auto">
                        <h3 className="font-bold group-hover:text-emerald-500 transition-colors truncate">
                          {chapter.title || `الفصل ${chapter.chapterNumber}`}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 sm:mt-1">
                          {formatRelativeArabicDate(chapter.publishDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                      {chapter.isPremium && (
                        <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${profile?.unlockedChapters?.includes(chapter.id) ? 'text-emerald-500 bg-emerald-500/10' : 'text-amber-500 bg-amber-500/10'}`}>
                          {profile?.unlockedChapters?.includes(chapter.id) ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />} {chapter.coinPrice}
                        </div>
                      )}
                      <span className="hidden xs:inline text-[10px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-zinc-400 transition-colors">
                        {chapter.content?.length || 0} صفحة
                      </span>
                      <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-emerald-500 transform rotate-180 group-hover:-translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <CommentsSection seriesId={series.id} isAdmin={profile?.role === 'admin'} />
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="glass-panel p-6 sm:p-8 rounded-[2rem] space-y-8 text-right border border-white/5 shadow-2xl relative overflow-hidden group">
            {/* Elegant decorative background glow */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/15 transition-all duration-700 pointer-events-none" />
            
            <div className="flex items-center gap-3 border-b border-white/5 pb-4">
              <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <Info className="w-5 h-5" />
              </span>
              <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">تفاصيل العمل</h3>
            </div>
            
            <div className="space-y-4">
              {/* الكاتب */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all border border-white/5 group/row">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-zinc-900 rounded-lg text-zinc-400 group-hover/row:text-emerald-400 transition-colors">
                    <User className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-black text-zinc-400">الكاتب</span>
                </div>
                <span className="text-sm font-bold text-white">{series.author}</span>
              </div>

              {/* المترجم */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all border border-white/5 group/row">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-zinc-900 rounded-lg text-zinc-400 group-hover/row:text-emerald-400 transition-colors">
                    <Languages className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-black text-zinc-400">المترجم</span>
                </div>
                <span className="text-sm font-bold text-white">{series.artist}</span>
              </div>

              {/* سنة الإصدار */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all border border-white/5 group/row">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-zinc-900 rounded-lg text-zinc-400 group-hover/row:text-emerald-400 transition-colors">
                    <Calendar className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-black text-zinc-400">سنة الإصدار</span>
                </div>
                <span className="text-sm font-bold text-white">{series.releaseYear}</span>
              </div>

              {/* النوع */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all border border-white/5 group/row">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-zinc-900 rounded-lg text-zinc-400 group-hover/row:text-emerald-400 transition-colors">
                    <BookOpen className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-black text-zinc-400">النوع</span>
                </div>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 shadow-sm shadow-emerald-500/5">
                  {series.type === 'Novel' ? 'رواية' : series.type}
                </span>
              </div>

              {/* الحالة */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all border border-white/5 group/row">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-zinc-900 rounded-lg text-zinc-400 group-hover/row:text-emerald-400 transition-colors">
                    <Activity className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-black text-zinc-400">الحالة</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${series.status === 'Ongoing' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-500'}`} />
                  <span className={`text-xs font-bold ${series.status === 'Ongoing' ? 'text-emerald-400' : 'text-zinc-400'}`}>
                    {series.status === 'Ongoing' ? 'مستمر' : series.status === 'Completed' ? 'مكتمل' : series.status}
                  </span>
                </div>
              </div>

              {/* المشاهدات */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] transition-all border border-white/5 group/row">
                <div className="flex items-center gap-2.5">
                  <span className="p-2 bg-zinc-900 rounded-lg text-zinc-400 group-hover/row:text-emerald-400 transition-colors">
                    <Eye className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-black text-zinc-400">المشاهدات</span>
                </div>
                <span className="text-sm font-bold text-white">{series.views.toLocaleString()}</span>
              </div>
            </div>

            {/* Tags section */}
            <div className="pt-4 text-right space-y-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-zinc-400">
                <Tag className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-black uppercase tracking-widest">الوسوم</span>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {series.tags.map(tag => (
                  <span 
                    key={tag} 
                    className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400 rounded-xl text-[10px] font-bold border border-white/5 transition-all hover:scale-105 active:scale-95 cursor-default flex items-center gap-1"
                  >
                    <span>#</span>
                    <span>{tag}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Works Section */}
      <AnimatePresence>
        {similarWorks.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-12 border-t border-white/5 space-y-8 text-right relative z-10"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="p-2.5 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <Sparkles className="w-5 h-5" />
                </span>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">أعمال مشابهة قد تعجبك</h2>
                  <p className="text-xs text-zinc-500 mt-1">مقترحات بناءً على التصنيف، الكاتب، القصة والاسم</p>
                </div>
              </div>
            </div>

            <div className="flex overflow-x-auto pb-6 -mx-4 px-4 sm:mx-0 sm:px-0 gap-4 sm:gap-6 pt-4 snap-x snap-mandatory scrollbar-hide">
              {similarWorks.map((work) => (
                <div key={work.id} className="min-w-[140px] sm:min-w-[180px] md:min-w-[200px] lg:min-w-[220px] transition-all duration-300 hover:-translate-y-1 snap-start shrink-0">
                  <SeriesCard series={work} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rating Modal */}
      <AnimatePresence>
        {isRatingModalOpen && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-950 w-full max-w-md rounded-[2rem] border border-white/10 shadow-2xl p-8 space-y-6 text-center"
            >
              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20">
                <Star className="w-8 h-8 fill-emerald-400 text-emerald-400 animate-pulse" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-white">تقييم العمل</h3>
                <p className="text-zinc-400 text-sm font-medium">ما هو تقييمك لـ "{series?.title}"؟</p>
              </div>

              {/* Stars selection */}
              <div className="flex justify-center items-center gap-3 py-4" dir="ltr">
                {[1, 2, 3, 4, 5].map((starsVal) => {
                  const isHoveredOrSelected = (hoveredStars !== null ? hoveredStars : selectedStars) >= starsVal;
                  return (
                    <button
                      key={starsVal}
                      type="button"
                      onMouseEnter={() => setHoveredStars(starsVal)}
                      onMouseLeave={() => setHoveredStars(null)}
                      onClick={() => setSelectedStars(starsVal)}
                      className="p-1 transition-transform active:scale-95 hover:scale-110 cursor-pointer"
                    >
                      <Star
                        className={`w-10 h-10 transition-colors duration-200 ${
                          isHoveredOrSelected
                            ? "text-emerald-400 fill-emerald-400"
                            : "text-zinc-600 fill-transparent"
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="text-sm font-bold text-zinc-500">
                {selectedStars} من أصل 5 نجوم
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={handleRatingSubmit}
                  className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-wider rounded-2xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                >
                  أرسل التقييم
                </button>
                <button
                  type="button"
                  onClick={() => setIsRatingModalOpen(false)}
                  className="flex-1 py-3.5 bg-white/5 hover:bg-white/10 text-zinc-300 font-bold rounded-2xl transition-all border border-white/10 active:scale-95"
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
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-[100] px-6 py-3 bg-zinc-900 border border-white/10 text-white rounded-full shadow-2xl font-bold text-sm whitespace-nowrap"
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
