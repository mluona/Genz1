import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, onSnapshot, collection, query, orderBy, getDocs, where, Timestamp, updateDoc, arrayUnion, arrayRemove, addDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestore';
import { signInWithPopup } from 'firebase/auth';
import CommentsSection from '../components/CommentsSection';
import { Star, Eye, Clock, List, MessageSquare, Heart, Share2, BookOpen, ChevronRight, User, Calendar, Lock, Unlock, Coins } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { Series, Chapter } from '../types';

export const SeriesDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [series, setSeries] = useState<Series | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [commentsCount, setCommentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'chapters' | 'comments'>('chapters');
  const [isFavorite, setIsFavorite] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

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
    if (!user || !series) {
      showToast("Please login to add to library");
      return;
    }
    const userRef = doc(db, 'users', user.uid);
    if (isFavorite) {
      await updateDoc(userRef, { favorites: arrayRemove(series.id) });
      setIsFavorite(false);
    } else {
      await updateDoc(userRef, { favorites: arrayUnion(series.id) });
      setIsFavorite(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: series?.title,
          text: `Check out ${series?.title} on GENZ!`,
          url: window.location.href,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link copied to clipboard!');
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed:", error);
      showToast("Login failed: " + error.message);
    }
  };

  useEffect(() => {
    if (!slug) return;

    const seriesQuery = query(collection(db, 'series'), where('slug', '==', slug));
    const unsubscribeSeries = onSnapshot(seriesQuery, (snapshot) => {
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        setSeries({ id: doc.id, ...doc.data() } as Series);
      }
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'series'));

    return () => unsubscribeSeries();
  }, [slug]);

  useEffect(() => {
    if (!series) return;

    const chaptersQuery = query(collection(db, `series/${series.id}/chapters`), orderBy('chapterNumber', 'desc'));
    const unsubscribeChapters = onSnapshot(chaptersQuery, (snapshot) => {
      setChapters(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter)));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `series/${series.id}/chapters`));

    const commentsQuery = query(collection(db, 'comments'), where('seriesId', '==', series.id));
    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      setCommentsCount(snapshot.docs.filter(doc => !doc.data().chapterId).length);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'comments'));

    return () => {
      unsubscribeChapters();
      unsubscribeComments();
    };
  }, [series]);

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!series) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Series not found</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 selection:bg-emerald-500 selection:text-black">
      <div className="atmosphere" />
      
      {/* Immersive Header */}
      <div className="relative min-h-[60vh] lg:min-h-[70vh] flex flex-col justify-end overflow-hidden">
        {/* Background Cover */}
        <div className="absolute inset-0 z-0">
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 blur-2xl scale-110"
            style={{ backgroundImage: `url(${series.backgroundImage || series.coverImage})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-zinc-950/20" />
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-transparent to-transparent opacity-80" />
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
                <div className="relative w-40 sm:w-64 aspect-[2/3] rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
                  <img
                    src={series.coverImage || undefined}
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
                className="flex-1 space-y-4 md:space-y-6"
              >
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="px-3 py-1 bg-emerald-500 text-black text-[10px] font-black rounded-full uppercase tracking-widest">
                    {series.type}
                  </span>
                  <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-widest border ${
                    series.status === 'Ongoing' ? 'border-emerald-500/50 text-emerald-500' : 'border-zinc-500/50 text-zinc-500'
                  }`}>
                    {series.status}
                  </span>
                </div>

                <h1 className="text-3xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-tight md:leading-none text-gradient" dir="auto">
                  {series.title}
                </h1>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 sm:gap-4 text-zinc-300 text-sm font-medium">
                  <div className="flex items-center gap-2 bg-zinc-900/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 shadow-sm">
                    <User className="w-4 h-4 text-emerald-500" />
                    <span>{series.author}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-900/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 shadow-sm">
                    <Star className="w-4 h-4 text-emerald-500 fill-current" />
                    <span className="text-white font-bold">{series.rating.toFixed(1)}</span>
                    <span className="text-xs opacity-50">({series.ratingCount})</span>
                  </div>
                  <div className="flex items-center gap-2 bg-zinc-900/60 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/5 shadow-sm">
                    <Calendar className="w-4 h-4 text-emerald-500" />
                    <span>{series.releaseYear}</span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-4">
                  {series.genres.map(genre => (
                    <Link key={genre} to={`/search?genre=${genre}`} className="px-4 py-1.5 bg-zinc-800/80 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-zinc-300 hover:text-white hover:bg-zinc-700 transition-all cursor-pointer shadow-sm">
                      {genre}
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
          <div className="flex flex-wrap gap-3 sm:gap-4">
            <button
              onClick={() => chapters.length > 0 && navigate(`/series/${series.slug}/${chapters[chapters.length - 1].chapterNumber}`)}
              className="m3-button-primary flex-1 sm:flex-none py-3 sm:py-4 px-6 sm:px-8 text-xs sm:text-sm"
            >
              <BookOpen className="w-4 h-4" /> Read First
            </button>
            <button 
              onClick={toggleFavorite}
              className={`flex-1 sm:flex-none py-3 sm:py-4 px-6 sm:px-8 text-xs sm:text-sm transition-all ${isFavorite ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/50 rounded-2xl font-black uppercase tracking-widest' : 'm3-button-secondary'}`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} /> {isFavorite ? 'In Library' : 'Library'}
            </button>
            <button 
              onClick={handleShare}
              className="p-3 sm:p-4 bg-zinc-900 border border-white/5 rounded-full hover:bg-zinc-800 transition-colors"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Tabs */}
          <section className="space-y-8">
            <div className="flex border-b border-white/5">
              <button
                onClick={() => setActiveTab('chapters')}
                className={`px-8 py-4 text-sm font-black uppercase tracking-widest transition-colors relative ${activeTab === 'chapters' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                Chapters ({chapters.length})
                {activeTab === 'chapters' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500" />}
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`px-8 py-4 text-sm font-black uppercase tracking-widest transition-colors relative ${activeTab === 'comments' ? 'text-white' : 'text-zinc-500 hover:text-white'}`}
              >
                Comments ({commentsCount})
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
                      <div className="min-w-0" dir="auto">
                        <h3 className="font-bold group-hover:text-emerald-500 transition-colors truncate">
                          {chapter.title || `Chapter ${chapter.chapterNumber}`}
                        </h3>
                        <p className="text-[10px] sm:text-xs text-zinc-500 mt-0.5 sm:mt-1">
                          {chapter.publishDate instanceof Timestamp ? format(chapter.publishDate.toDate(), 'MMM dd, yyyy') : 'Recently'}
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
                        {chapter.content?.length || 0} Pages
                      </span>
                      <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-emerald-500 transform group-hover:translate-x-1 transition-all" />
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <CommentsSection seriesId={series.id} isAdmin={profile?.role === 'admin'} />
            )}
          </section>

          {/* Synopsis */}
          <section className="space-y-4">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <div className="w-1 h-6 bg-emerald-500 rounded-full" />
              Synopsis
            </h2>
            <div className="glass-panel p-8 rounded-[2rem] leading-relaxed text-zinc-300" dir="auto">
              {series.description}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="glass-panel p-8 rounded-[2rem] space-y-8">
            <h3 className="text-lg font-black tracking-tight uppercase tracking-widest text-zinc-500">Details</h3>
            
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Artist</span>
                <span className="text-sm font-bold">{series.artist}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Release</span>
                <span className="text-sm font-bold">{series.releaseYear}</span>
              </div>
              <div className="h-px bg-white/5" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-500">Type</span>
                <span className="px-2 py-1 bg-zinc-950 rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/5">
                  {series.type}
                </span>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-4">Tags</p>
              <div className="flex flex-wrap gap-2">
                {series.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-zinc-950 text-zinc-400 rounded-lg text-[10px] font-bold border border-white/5">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Ad or Promo Space */}
          <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden group">
            <img
              src="https://picsum.photos/seed/promo/600/800"
              alt="Promo"
              className="w-full h-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-1000"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/80 to-transparent flex flex-col justify-end p-8">
              <p className="text-black font-black text-2xl tracking-tighter leading-none mb-4">
                JOIN OUR <br /> DISCORD
              </p>
              <button className="w-full py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest">
                Join Now
              </button>
            </div>
          </div>
        </div>
      </div>

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
