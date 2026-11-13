import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { Series, Chapter } from '../types';
import { CollectionsSection } from '../components/CollectionsSection';
import { LatestUpdatesSection } from '../components/LatestUpdatesSection';
import { EditorsChoiceSection } from '../components/EditorsChoiceSection';
import { ChevronLeft, Forward, Bug, Send, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { FeaturedSlider } from '../components/FeaturedSlider';

import { getProxiedImageUrl } from '../utils/imageUtils';

const DiscordIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.88-.65,1.72-1.34,2.51-2a75.58,75.58,0,0,0,73,0c.79.69,1.63,1.39,2.51,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.81,49.11,123.4,26.47,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.9,46,53.9,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.14,46,96.14,53,91,65.69,84.69,65.69Z" />
  </svg>
);

export const Home: React.FC = () => {
  const [allSeries, setAllSeries] = useState<Series[]>([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState<Series[]>([]);
  const [chaptersBySeries, setChaptersBySeries] = useState<Record<string, Chapter[]>>({});
  const [dailyTop, setDailyTop] = useState<Series[]>([]);
  const [newWorks, setNewWorks] = useState<Series[]>([]);
  const [popularWorks, setPopularWorks] = useState<Series[]>([]);
  const [completedWorks, setCompletedWorks] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);

  // Interactive Options States
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportEmail, setReportEmail] = useState('');
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const handleShare = async () => {
    const shareText = "شاهد أفضل الروايات على";
    const shareUrl = "https://genzmanhw.vercel.app/";
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GENZ',
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.log("Navigator share failed, copying link instead", err);
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
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2500);
      } else {
        throw new Error("Document not focused");
      }
    } catch (err) {
      console.warn("Navigator clipboard failed, trying fallback", err);
      // Fallback
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2500);
      } catch (fallbackErr) {
        console.error("Fallback clipboard failed", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;
    
    setReportSubmitted(true);
    setTimeout(() => {
      setIsReportModalOpen(false);
      setReportSubmitted(false);
      setReportText('');
      setReportEmail('');
    }, 2000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch All Series for Collections
        const { data: allData } = await supabase
          .from('series')
          .select('id, title, coverImage, genres, slug, type, rating')
          .order('rating', { ascending: false });
        if (allData) setAllSeries(allData as Series[]);

        // Fetch Recently Updated (24 items so category filters have plenty of results)
        const { data: recentData } = await supabase
          .from('series')
          .select('*')
          .order('lastUpdated', { ascending: false })
          .limit(24);
        if (recentData) {
          const recentSeriesList = recentData as Series[];
          setRecentlyUpdated(recentSeriesList);

          const recentIds = recentSeriesList.map((s) => s.id);
          if (recentIds.length > 0) {
            const { data: chaptersData } = await supabase
              .from('chapters')
              .select('id, seriesId, chapterNumber, title, publishDate, isPremium, coinPrice')
              .in('seriesId', recentIds)
              .order('chapterNumber', { ascending: false });

            if (chaptersData) {
              const grouped: Record<string, Chapter[]> = {};
              (chaptersData as Chapter[]).forEach((ch) => {
                if (!grouped[ch.seriesId]) grouped[ch.seriesId] = [];
                if (grouped[ch.seriesId].length < 4) {
                  grouped[ch.seriesId].push(ch);
                }
              });
              setChaptersBySeries(grouped);
            }
          }
        }

        // Fetch Daily Top (5 works max for Trending)
        const { data: dailyData } = await supabase
          .from('series')
          .select('*')
          .order('dailyViews', { ascending: false })
          .limit(5);
        if (dailyData) setDailyTop(dailyData as Series[]);

        // Fetch Recently Added (أضيف مؤخراً)
        const { data: newData } = await supabase
          .from('series')
          .select('*')
          .order('createdAt', { ascending: false })
          .limit(10);
        if (newData) setNewWorks(newData as Series[]);

        // Fetch Popular Works / Editor's Choice
        const { data: popularData } = await supabase
          .from('series')
          .select('*')
          .order('rating', { ascending: false })
          .limit(6);
        if (popularData) setPopularWorks(popularData as Series[]);

        // Fetch Completed Works (الأعمال المكتملة)
        const { data: completedData } = await supabase
          .from('series')
          .select('*')
          .eq('status', 'Completed')
          .order('lastUpdated', { ascending: false })
          .limit(10);
        if (completedData) setCompletedWorks(completedData as Series[]);

      } catch (error) {
        console.error("Error fetching data from Supabase:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Set up real-time subscription for series updates
    const channel = supabase
      .channel('series_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'series' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 selection:bg-emerald-500 selection:text-black">
      <div className="atmosphere" />
      
      {/* Featured Slider Carousel Section */}
      <section className="pt-24 md:pt-28 pb-4">
        <FeaturedSlider seriesList={popularWorks} />
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 space-y-20 mt-10">
        {/* Collections Carousel Section */}
        <CollectionsSection seriesList={allSeries} />

        {/* Interactive Features Block (تحت متميز) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Share Card */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-5 flex items-center justify-between" dir="rtl">
            <div className="flex items-center gap-3.5">
              <div className="w-[3px] h-11 bg-blue-500 rounded-full" />
              <div className="text-right">
                <h3 className="text-[15px] font-black text-white">شارك Genz</h3>
                <p className="text-zinc-400 text-[10px] font-bold mt-1">مع أصدقائك</p>
              </div>
            </div>
            <button 
              onClick={handleShare}
              className="bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-[11px] font-black px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-[0_4px_15px_rgba(37,99,235,0.25)] transition-all shrink-0 cursor-pointer"
            >
              <Forward className="w-3.5 h-3.5 rotate-180" />
              <span>شارك</span>
            </button>
          </div>

          {/* Discord Card */}
          <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-5 flex items-center justify-between" dir="rtl">
            <div className="flex items-center gap-3.5">
              <div className="w-[3px] h-11 bg-[#5865F2] rounded-full" />
              <div className="text-right">
                <h3 className="text-[15px] font-black text-white">انضم لمجتمعنا</h3>
                <p className="text-zinc-400 text-[10px] font-bold mt-1">تواصل مع عشاق الروايات</p>
              </div>
            </div>
            <a 
              href="https://discord.gg/effXNBHsT" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="bg-[#5865F2] hover:bg-[#4d5bfa] active:scale-95 text-white text-[11px] font-black px-5 py-2.5 rounded-full flex items-center gap-1.5 shadow-[0_4px_15px_rgba(88,101,242,0.25)] transition-all shrink-0 cursor-pointer"
            >
              <DiscordIcon />
              <span>Discord</span>
            </a>
          </div>

          {/* Bug / Support Card */}
          <div className="md:col-span-2 lg:col-span-1 bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[1.5rem] p-5 flex items-center justify-between gap-4" dir="rtl">
            <div className="flex items-center gap-3.5 text-right flex-1 min-w-0">
              <div className="bg-zinc-950/80 border border-white/10 p-2.5 rounded-xl text-zinc-400 flex items-center justify-center shadow-inner h-10 w-10 shrink-0">
                <Bug className="w-5 h-5 text-emerald-400 animate-pulse" />
              </div>
              <div className="min-w-0">
                <h3 className="text-[14px] font-black text-white leading-tight truncate">هل تحتاج مساعدة أو وجدت مشكلة؟</h3>
                <p className="text-zinc-400 text-[9px] font-medium leading-relaxed mt-1 line-clamp-1">
                  بلّغ عن الأخطاء أو مشاكل الدفع أو أي مشكلة أخرى - احصل على مكافآت
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsReportModalOpen(true)}
              className="bg-zinc-800/80 hover:bg-zinc-700 hover:text-white active:scale-95 text-zinc-300 text-[10px] font-black px-4 py-2.5 rounded-xl border border-white/5 transition-all shrink-0 cursor-pointer text-center"
            >
              الإبلاغ عن مشكلة
            </button>
          </div>
        </section>

        {/* Latest Updates Section */}
        <LatestUpdatesSection seriesList={recentlyUpdated} chaptersBySeries={chaptersBySeries} />

        {/* Trending Section (رائج - 5 أعمال الأكثر مشاهدة يومياً) */}
        {dailyTop.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight text-white">رائج</h2>
            </div>

            <div className="flex gap-3.5 sm:gap-4 overflow-x-auto hide-scrollbar pb-2 snap-x snap-mandatory">
              {dailyTop.slice(0, 5).map((series) => (
                <Link
                  key={series.id}
                  to={`/series/${series.slug}`}
                  className="w-[42vw] max-w-[175px] sm:w-[200px] md:w-[220px] lg:w-[calc((100%-4rem)/5)] shrink-0 snap-start aspect-[3/4] rounded-2xl overflow-hidden relative bg-zinc-900 border border-white/10 group block"
                >
                  <img
                    src={getProxiedImageUrl(series.coverImage)}
                    alt={series.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/20" />

                  <div className="absolute top-2.5 right-2.5">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/55 backdrop-blur-md text-white text-[10px] font-bold border border-white/15">
                      {series.type === 'Novel' ? 'رواية' : series.type}
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-right" dir="auto">
                    {series.author && (
                      <p className="text-[11px] text-zinc-300/85 truncate mb-0.5">{series.author}</p>
                    )}
                    <h3 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-2 drop-shadow-md group-hover:text-emerald-400 transition-colors">
                      {series.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Recently Added Section (أضيف مؤخراً) */}
        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black tracking-tight text-white">أضيف مؤخراً</h2>
            <Link
              to="/library"
              className="flex items-center gap-1 text-sm font-bold text-zinc-400 hover:text-emerald-400 transition-colors"
            >
              <span>عرض الكل</span>
              <ChevronLeft className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
            {newWorks.slice(0, 10).map((series) => (
              <Link
                key={series.id}
                to={`/series/${series.slug}`}
                className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 group block"
              >
                <img
                  src={getProxiedImageUrl(series.coverImage)}
                  alt={series.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/20" />

                <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/55 backdrop-blur-md text-white text-[10px] font-bold border border-white/15">
                    جديد
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-black/55 backdrop-blur-md text-white text-[10px] font-bold border border-white/15">
                    {series.type === 'Novel' ? 'رواية' : series.type}
                  </span>
                </div>

                <div className="absolute bottom-3 left-3 right-3 text-right" dir="auto">
                  {series.author && (
                    <p className="text-[11px] text-zinc-300/85 truncate mb-0.5">{series.author}</p>
                  )}
                  <h3 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-2 drop-shadow-md group-hover:text-emerald-400 transition-colors">
                    {series.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Editor's Choice Section (اختيار المحررين) */}
        <EditorsChoiceSection seriesList={popularWorks} />

        {/* Completed Series Section (الأعمال المكتملة - تظهر فقط عند وجود أعمال مكتملة) */}
        {completedWorks.length > 0 && (
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black tracking-tight text-white">الأعمال المكتملة</h2>
              <Link
                to="/library"
                className="flex items-center gap-1 text-sm font-bold text-zinc-400 hover:text-emerald-400 transition-colors"
              >
                <span>عرض الكل</span>
                <ChevronLeft className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {completedWorks.map((series) => (
                <Link
                  key={series.id}
                  to={`/series/${series.slug}`}
                  className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-zinc-900 border border-white/10 group block"
                >
                  <img
                    src={getProxiedImageUrl(series.coverImage)}
                    alt={series.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-black/20" />

                  <div className="absolute top-2.5 right-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full bg-black/55 backdrop-blur-md text-white text-[10px] font-bold border border-white/15">
                      {series.type === 'Novel' ? 'رواية' : series.type}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-red-600/85 backdrop-blur-md text-white text-[10px] font-bold border border-red-400/30">
                      مكتمل
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-right" dir="auto">
                    {series.author && (
                      <p className="text-[11px] text-zinc-300/85 truncate mb-0.5">{series.author}</p>
                    )}
                    <h3 className="text-sm sm:text-base font-black text-white leading-snug line-clamp-2 drop-shadow-md group-hover:text-emerald-400 transition-colors">
                      {series.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

      </div>

      {/* Report Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsReportModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl text-right overflow-hidden z-10"
              dir="rtl"
            >
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="absolute top-4 left-4 p-2 text-zinc-400 hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20">
                  <Bug className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">الإبلاغ عن مشكلة</h3>
                  <p className="text-xs text-zinc-400 mt-1">دعنا نصلح هذا الأمر معًا. سيتم مراجعة بلاغك فورًا!</p>
                </div>
              </div>

              {reportSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-12 text-center space-y-4"
                >
                  <div className="w-16 h-16 bg-emerald-500/15 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-3xl font-black animate-bounce">
                    ✓
                  </div>
                  <h4 className="text-lg font-bold text-white">تم إرسال البلاغ بنجاح!</h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    شكرًا لك على مساعدتنا في تحسين التجربة. لقد تم تسجيل البلاغ وسنعالجه في أسرع وقت.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-5">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">عنوان البريد الإلكتروني (اختياري)</label>
                    <input 
                      type="email" 
                      value={reportEmail}
                      onChange={(e) => setReportEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-zinc-950/80 border border-white/5 focus:border-emerald-500 outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors text-right"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">تفاصيل المشكلة أو الخطأ <span className="text-red-500">*</span></label>
                    <textarea 
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      required
                      rows={4}
                      placeholder="يرجى وصف المشكلة بالتفصيل ومكان حدوثها..."
                      className="w-full bg-zinc-950/80 border border-white/5 focus:border-emerald-500 outline-none rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 transition-colors text-right resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black py-3.5 rounded-xl text-sm transition-all shadow-[0_4px_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>إرسال البلاغ</span>
                    <Send className="w-4 h-4 rotate-180" />
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Share Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[2000] bg-emerald-500 text-black text-xs font-black px-6 py-3 rounded-full flex items-center gap-2 shadow-[0_8px_30px_rgba(16,185,129,0.4)] border border-emerald-400/20"
            dir="rtl"
          >
            <span>✓ تم نسخ رابط الموقع لمشاركته مع أصدقائك!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

