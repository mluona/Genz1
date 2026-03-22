import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, onSnapshot, collection, query, where, getDocs, getDoc, updateDoc, arrayUnion, arrayRemove, Timestamp, orderBy, addDoc, getCountFromServer } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestore';
import CommentsSection from '../components/CommentsSection';
import { ChevronLeft, ChevronRight, Settings, Maximize2, List, Moon, Sun, Layout, ArrowUp, Bookmark, BookmarkCheck, Menu, X, Share2, MessageSquare, Heart, Lock, Coins } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'motion/react';
import { Series, Chapter } from '../types';

const LazyPage = ({ seriesId, chapterId, pageIndex, initialSrc, mode = 'vertical', onLoaded }: { seriesId: string, chapterId: string, pageIndex: number, initialSrc: string, mode?: 'vertical' | 'horizontal' | 'preload', onLoaded?: () => void }) => {
  const needsProcessing = initialSrc && initialSrc.startsWith('data:image/');
  const [src, setSrc] = useState<string>(needsProcessing ? '' : initialSrc);
  const [loading, setLoading] = useState(needsProcessing || !initialSrc);
  const [isVisible, setIsVisible] = useState(mode === 'preload' ? true : false); // Preload immediately
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    let blobUrl: string | null = null;
    if (initialSrc) {
      if (initialSrc.startsWith('data:image/')) {
        let active = true;
        fetch(initialSrc)
          .then(res => res.blob())
          .then(blob => {
            if (active) {
              blobUrl = URL.createObjectURL(blob);
              setSrc(blobUrl);
              setLoading(false);
            }
          })
          .catch(() => {
            if (active) {
              setSrc(initialSrc);
              setLoading(false);
            }
          });
        return () => { 
          active = false; 
          if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
      } else {
        setSrc(initialSrc);
        setLoading(false);
      }
    }

    if (mode === 'preload') return; // Already visible

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: '1000px' }); // Load when within 1000px of viewport

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [initialSrc, mode]);

  useEffect(() => {
    if (initialSrc || !isVisible) return;

    let isMounted = true;
    let blobUrl: string | null = null;
    const fetchPage = async () => {
      try {
        const pageId = `page_${pageIndex.toString().padStart(4, '0')}`;
        const pageRef = doc(db, `series/${seriesId}/chapters/${chapterId}/pages`, pageId);
        const pageSnap = await getDoc(pageRef);
        
        if (pageSnap.exists() && isMounted) {
          const content = pageSnap.data().content;
          if (content && content.startsWith('data:image/')) {
            try {
              const res = await fetch(content);
              const blob = await res.blob();
              if (isMounted) {
                blobUrl = URL.createObjectURL(blob);
                setSrc(blobUrl);
              }
            } catch (e) {
              if (isMounted) setSrc(content);
            }
          } else if (isMounted) {
            setSrc(content);
          }
        }
      } catch (error) {
        console.error("Failed to load page", pageIndex, error);
      } finally {
        if (isMounted) {
          setLoading(false);
          if (onLoaded) onLoaded();
        }
      }
    };

    fetchPage();
    return () => { 
      isMounted = false; 
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [seriesId, chapterId, pageIndex, initialSrc, isVisible]);

  useEffect(() => {
    if (src) {
      console.log(`Page ${pageIndex + 1} src:`, src.substring(0, 100) + (src.length > 100 ? '...' : ''));
    }
  }, [src, pageIndex]);

  if (mode === 'preload') {
    return src ? <img src={src} style={{ display: 'none' }} referrerPolicy="no-referrer" alt="preload next" /> : null;
  }

  return (
    <div ref={containerRef} className={`relative flex items-center justify-center bg-zinc-950/50 ${mode === 'horizontal' ? 'w-full h-full' : 'w-full min-h-[50vh]'}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {src && mode === 'horizontal' ? (
        <motion.img 
          key={src}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          src={src} 
          alt={`Page ${pageIndex + 1}`} 
          className="max-h-full max-w-full object-contain shadow-2xl"
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={onLoaded}
          onError={(e) => {
            console.error(`Failed to load image for page ${pageIndex + 1}:`, src.substring(0, 100));
            e.currentTarget.style.display = 'none';
            // Optional: show a fallback UI here
          }}
        />
      ) : src ? (
        <motion.img 
          key={src}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          src={src} 
          alt={`Page ${pageIndex + 1}`} 
          className="w-full h-auto block" 
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={onLoaded}
          onError={(e) => {
            console.error(`Failed to load image for page ${pageIndex + 1}:`, src.substring(0, 100));
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : null}
    </div>
  );
};

export const Reader: React.FC = () => {
  const { slug, chapterNum } = useParams<{ slug: string; chapterNum: string }>();
  const { user, profile, loading: authLoading } = useAuth();
  const { theme: appTheme, toggleTheme: toggleAppTheme } = useTheme();
  const navigate = useNavigate();
  const [series, setSeries] = useState<Series | null>(null);
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Settings
  const [viewMode, setViewMode] = useState<'vertical' | 'horizontal'>('horizontal');
  const [fontSize, setFontSize] = useState(18);
  const [lineHeight, setLineHeight] = useState(1.8);
  const [currentPage, setCurrentPage] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };
  
  const [fontFamily, setFontFamily] = useState<'serif' | 'sans' | 'mono'>('serif');
  const [novelTheme, setNovelTheme] = useState<'dark' | 'light' | 'sepia'>('dark');
  const [showSettings, setShowSettings] = useState(false);
  
  const [commentsCount, setCommentsCount] = useState(0);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (!series || !chapter) return;
    const commentsQuery = query(collection(db, 'comments'), where('seriesId', '==', series.id), where('chapterId', '==', chapter.id));
    const unsubscribeComments = onSnapshot(commentsQuery, (snapshot) => {
      setCommentsCount(snapshot.docs.length);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'comments'));
    return () => unsubscribeComments();
  }, [series, chapter]);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${series?.title} - Chapter ${chapter?.chapterNumber}`,
          text: `Read Chapter ${chapter?.chapterNumber} of ${series?.title} on GENZ!`,
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

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Track current page in vertical mode and reading progress
  useEffect(() => {
    const handleScroll = () => {
      // Reading progress
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (window.scrollY / totalHeight) * 100 : 0;
      setReadingProgress(progress);

      if (viewMode !== 'vertical') return;

      const scrollPosition = window.scrollY + window.innerHeight / 2;
      let current = 0;
      for (let i = 0; i < imageRefs.current.length; i++) {
        const img = imageRefs.current[i];
        if (img && img.offsetTop <= scrollPosition) {
          current = i;
        } else {
          break;
        }
      }
      setCurrentPage(current);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [viewMode, chapter]);

  const [isPremiumLocked, setIsPremiumLocked] = useState(false);

  useEffect(() => {
    if (!slug || !chapterNum || authLoading) return;

    // Fetch series and chapters
    const fetchSeries = async () => {
      // Assuming slug is ID for now
      const seriesDoc = await getDocs(query(collection(db, 'series'), where('slug', '==', slug)));
      if (!seriesDoc.empty) {
        const s = { id: seriesDoc.docs[0].id, ...seriesDoc.docs[0].data() } as Series;
        setSeries(s);

        const chaptersQuery = query(collection(db, `series/${s.id}/chapters`), where('chapterNumber', '==', Number(chapterNum)));
        const chapterSnapshot = await getDocs(chaptersQuery);
        if (!chapterSnapshot.empty) {
          const chapterData = { id: chapterSnapshot.docs[0].id, ...chapterSnapshot.docs[0].data() } as Chapter;
          
          // Check premium status
          if (chapterData.isPremium) {
            const isUnlocked = profile?.unlockedChapters?.includes(chapterData.id);
            if (!isUnlocked) {
              setIsPremiumLocked(true);
              setChapter({ ...chapterData, content: [] });
              setLoading(false);
              return;
            }
          }
          
          setIsPremiumLocked(false);

          if (s.type !== 'Novel') {
            if (!chapterData.content || chapterData.content.length === 0) {
              const pagesRef = collection(db, `series/${s.id}/chapters/${chapterData.id}/pages`);
              const snapshot = await getCountFromServer(pagesRef);
              const count = snapshot.data().count;
              chapterData.content = Array(count).fill('');
            }
          }
          
          setChapter(chapterData);
          
          // Save to history
          if (user) {
            const userRef = doc(db, 'users', user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
              const userData = userSnap.data();
              const currentHistory = userData.history || [];
              const newHistory = currentHistory.filter((h: any) => h.seriesId !== s.id);
              
              newHistory.push({
                seriesId: s.id,
                lastChapterId: chapterSnapshot.docs[0].id,
                timestamp: Timestamp.now()
              });
              
              if (newHistory.length > 50) {
                newHistory.shift();
              }
              
              await updateDoc(userRef, {
                history: newHistory
              });
            }
          }
        }

        const allChaptersQuery = query(collection(db, `series/${s.id}/chapters`), orderBy('chapterNumber', 'asc'));
        const allChaptersSnapshot = await getDocs(allChaptersQuery);
        setChapters(allChaptersSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Chapter)));
      }
      setLoading(false);
    };

    fetchSeries();
  }, [slug, chapterNum, user, authLoading]);

  useEffect(() => {
    if (profile && chapter) {
      setIsBookmarked(profile.bookmarks?.includes(chapter.id) || false);
    }
  }, [profile, chapter]);

  const toggleBookmark = async () => {
    if (!user || !chapter) return;
    const userRef = doc(db, 'users', user.uid);
    if (isBookmarked) {
      await updateDoc(userRef, { bookmarks: arrayRemove(chapter.id) });
      setIsBookmarked(false);
    } else {
      await updateDoc(userRef, { bookmarks: arrayUnion(chapter.id) });
      setIsBookmarked(true);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const nextChapter = chapters.find(c => c.chapterNumber === Number(chapterNum) + 1);
  const prevChapter = chapters.find(c => c.chapterNumber === Number(chapterNum) - 1);

  const handleUnlockChapter = async () => {
    if (!user || !profile || !chapter || !chapter.coinPrice) return;
    
    const userCoins = profile.coins || 0;
    if (userCoins < chapter.coinPrice) {
      showToast("Not enough coins! Redirecting to profile...");
      setTimeout(() => navigate('/profile'), 2000);
      return;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        coins: userCoins - chapter.coinPrice,
        unlockedChapters: arrayUnion(chapter.id)
      });

      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: -chapter.coinPrice,
        type: 'unlock_chapter',
        description: `Unlocked Chapter ${chapter.chapterNumber} of ${series?.title}`,
        timestamp: Timestamp.now(),
        chapterId: chapter.id,
        seriesId: series?.id
      });

      setIsPremiumLocked(false);
      
      // Fetch content after unlocking
      if (series?.type !== 'Novel') {
        const pagesRef = collection(db, `series/${series?.id}/chapters/${chapter.id}/pages`);
        const snapshot = await getCountFromServer(pagesRef);
        const count = snapshot.data().count;
        setChapter({ ...chapter, content: Array(count).fill('') });
      } else {
        const chapterDoc = await getDoc(doc(db, `series/${series?.id}/chapters`, chapter.id));
        if (chapterDoc.exists()) {
          setChapter({ id: chapterDoc.id, ...chapterDoc.data() } as Chapter);
        }
      }
      
    } catch (error) {
      console.error("Error unlocking chapter:", error);
      showToast("Failed to unlock chapter.");
    }
  };

  const handleTipCreator = async (amount: number) => {
    if (!user || !profile) {
      showToast("Please log in to tip the creator.");
      return;
    }
    if ((profile.coins || 0) < amount) {
      showToast("Not enough coins to tip! Redirecting to profile...");
      setTimeout(() => navigate('/profile'), 2000);
      return;
    }
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        coins: (profile.coins || 0) - amount
      });
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: -amount,
        type: 'support_creator',
        description: `Tipped creator for ${series?.title}`,
        timestamp: Timestamp.now(),
        seriesId: series?.id
      });
      showToast(`Thank you for supporting the creator with ${amount} coins!`);
    } catch (error) {
      console.error("Error tipping creator:", error);
      showToast("Failed to send tip.");
    }
  };

  const getNovelThemeStyles = () => {
    switch (novelTheme) {
      case 'light': return 'bg-zinc-50 text-zinc-900';
      case 'sepia': return 'bg-[#f4ecd8] text-[#5b4636]';
      case 'dark': default: return 'bg-zinc-950 text-white';
    }
  };

  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case 'sans': return 'font-sans';
      case 'mono': return 'font-mono';
      case 'serif': default: return 'font-serif';
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!series || !chapter) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Chapter not found</div>;

  return (
    <div 
      ref={containerRef}
      className={`min-h-screen transition-colors duration-500 ${series?.type === 'Novel' ? getNovelThemeStyles() : 'bg-zinc-950 text-white'}`}
    >
      {/* Top Navigation Bar */}
      <motion.div 
        initial={{ y: -100 }}
        animate={{ y: showControls ? 0 : -100 }}
        className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="absolute bottom-0 left-0 h-0.5 bg-emerald-500 transition-all duration-150" style={{ width: `${readingProgress}%` }} />
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-6">
            <button 
              onClick={() => setShowSidebar(true)}
              className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-all text-zinc-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate(`/series/${series.slug}`)}
              className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-all group"
              title="Back to Series"
            >
              <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
            <div className="hidden sm:block">
              <h1 className="text-sm font-black tracking-tight truncate max-w-xs" dir="auto">{series.title}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Chapter {chapter.chapterNumber}</span>
                <div className="w-1 h-1 bg-zinc-700 rounded-full" />
                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest" dir="auto">{chapter.title || 'Untitled'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {series.type === 'Novel' ? (
              <div className="relative">
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowSettings(!showSettings) }}
                  className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-all text-zinc-400 hover:text-white"
                  title="Reading Settings"
                >
                  <Settings className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showSettings && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl z-50 text-white"
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="space-y-6">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Theme</p>
                          <div className="flex gap-2">
                            <button onClick={() => setNovelTheme('dark')} className={`flex-1 py-2 rounded-xl border ${novelTheme === 'dark' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-white/10 text-zinc-400 hover:text-white'}`}>Dark</button>
                            <button onClick={() => setNovelTheme('light')} className={`flex-1 py-2 rounded-xl border ${novelTheme === 'light' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-white/10 text-zinc-400 hover:text-white'}`}>Light</button>
                            <button onClick={() => setNovelTheme('sepia')} className={`flex-1 py-2 rounded-xl border ${novelTheme === 'sepia' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-white/10 text-zinc-400 hover:text-white'}`}>Sepia</button>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Font Family</p>
                          <div className="flex gap-2">
                            <button onClick={() => setFontFamily('serif')} className={`flex-1 py-2 rounded-xl border font-serif ${fontFamily === 'serif' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-white/10 text-zinc-400 hover:text-white'}`}>Serif</button>
                            <button onClick={() => setFontFamily('sans')} className={`flex-1 py-2 rounded-xl border font-sans ${fontFamily === 'sans' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-white/10 text-zinc-400 hover:text-white'}`}>Sans</button>
                            <button onClick={() => setFontFamily('mono')} className={`flex-1 py-2 rounded-xl border font-mono ${fontFamily === 'mono' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-white/10 text-zinc-400 hover:text-white'}`}>Mono</button>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Text Size</p>
                          <div className="flex items-center gap-4">
                            <button onClick={() => setFontSize(Math.max(12, fontSize - 2))} className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700">-</button>
                            <span className="flex-1 text-center font-bold">{fontSize}px</span>
                            <button onClick={() => setFontSize(Math.min(32, fontSize + 2))} className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700">+</button>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3">Line Height</p>
                          <div className="flex items-center gap-4">
                            <button onClick={() => setLineHeight(Math.max(1.2, lineHeight - 0.2))} className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700">-</button>
                            <span className="flex-1 text-center font-bold">{lineHeight.toFixed(1)}</span>
                            <button onClick={() => setLineHeight(Math.min(2.5, lineHeight + 0.2))} className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center hover:bg-zinc-700">+</button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex bg-zinc-900 p-1 rounded-2xl border border-white/5">
                <button 
                  onClick={() => setViewMode('vertical')}
                  className={`p-2 rounded-xl transition-all ${viewMode === 'vertical' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-white'}`}
                  title="Vertical Scroll"
                >
                  <Layout className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setViewMode('horizontal')}
                  className={`p-2 rounded-xl transition-all ${viewMode === 'horizontal' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-white'}`}
                  title="Horizontal Paging"
                >
                  <Layout className="w-4 h-4 rotate-90" />
                </button>
              </div>
            )}

            <div className="h-6 w-px bg-white/5 mx-2" />

            {user && (
              <button 
                onClick={toggleBookmark}
                className={`p-3 rounded-2xl transition-all ${isBookmarked ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white'}`}
                title={isBookmarked ? "Remove Bookmark" : "Bookmark Chapter"}
              >
                {isBookmarked ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            )}

            <button 
              onClick={() => setShowComments(true)}
              className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-all text-zinc-400 hover:text-white relative"
              title="Comments"
            >
              <MessageSquare className="w-4 h-4" />
              {commentsCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-emerald-500 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {commentsCount > 99 ? '99+' : commentsCount}
                </div>
              )}
            </button>

            <button 
              onClick={handleShare}
              className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-all text-zinc-400 hover:text-white"
              title="Share Chapter"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button 
              onClick={toggleAppTheme}
              className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-all text-zinc-400 hover:text-white"
            >
              {appTheme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            <button 
              onClick={toggleFullscreen}
              className="p-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-all text-zinc-400 hover:text-white"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Reader Content Area */}
      <div 
        className={`relative flex flex-col items-center ${series?.type === 'Novel' || viewMode === 'vertical' ? 'pt-24 pb-40 min-h-screen' : 'h-screen pt-20 pb-0 overflow-hidden'}`}
        onClick={() => setShowControls(!showControls)}
      >
        {isPremiumLocked ? (
          <div className="flex flex-col items-center justify-center h-full space-y-6 text-center px-4 w-full max-w-md mx-auto my-auto py-32">
            <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-12 h-12 text-amber-500" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter">Premium Chapter</h2>
            <p className="text-zinc-400">This chapter requires coins to unlock. Support the creator to continue reading!</p>
            <button 
              onClick={(e) => { e.stopPropagation(); handleUnlockChapter(); }} 
              className="flex items-center gap-3 px-8 py-4 bg-amber-500 text-black font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-amber-500/20 w-full justify-center mt-4"
            >
              <Coins className="w-5 h-5" /> Unlock for {chapter.coinPrice} Coins
            </button>
          </div>
        ) : series.type === 'Novel' ? (
          <div className="max-w-3xl w-full px-6 py-12 space-y-8">
            <div 
              className={`${getFontFamilyClass()} leading-relaxed whitespace-pre-wrap`}
              style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
              dir="auto"
            >
              {chapter.content.join('\n\n')}
            </div>
            
            {/* End of Chapter Actions */}
            <div className="m3-section-gap text-center space-y-8">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
              <h2 className="text-3xl font-black tracking-tighter uppercase italic text-zinc-500">End of Chapter</h2>
              
              {/* Tip Creator Section */}
              <div className="bg-zinc-900/50 border border-amber-500/20 rounded-3xl p-8 max-w-md mx-auto space-y-6">
                <div className="flex items-center justify-center gap-3 text-amber-500">
                  <Heart className="w-6 h-6 fill-amber-500" />
                  <h3 className="text-xl font-black uppercase tracking-tight">Support Creator</h3>
                </div>
                <p className="text-sm text-zinc-400">Enjoyed the chapter? Show your appreciation by tipping coins to the creator!</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[10, 50, 100].map(amount => (
                    <button
                      key={amount}
                      onClick={(e) => { e.stopPropagation(); handleTipCreator(amount); }}
                      className="flex items-center gap-2 px-6 py-3 bg-zinc-950 border border-amber-500/30 hover:bg-amber-500 hover:text-black text-amber-500 font-bold rounded-xl transition-all"
                    >
                      <Coins className="w-4 h-4" /> {amount}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                {prevChapter && (
                  <button 
                    onClick={() => navigate(`/series/${slug}/${prevChapter.chapterNumber}`)}
                    className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white font-black rounded-2xl hover:bg-zinc-800 transition-all border border-white/5 w-full sm:w-auto justify-center"
                  >
                    <ChevronLeft className="w-5 h-5" /> Previous Chapter
                  </button>
                )}
                {nextChapter && (
                  <button 
                    onClick={() => navigate(`/series/${slug}/${nextChapter.chapterNumber}`)}
                    className="flex items-center gap-3 px-12 py-5 bg-emerald-500 text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 w-full sm:w-auto justify-center"
                  >
                    Next Chapter <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                {!nextChapter && (
                  <button 
                    onClick={() => navigate(`/series/${series.slug}`)}
                    className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white font-black rounded-2xl hover:bg-zinc-800 transition-all border border-white/5 w-full sm:w-auto justify-center"
                  >
                    Back to Series
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : viewMode === 'vertical' ? (
          <div className="max-w-3xl w-full shadow-2xl relative">
            {/* Floating Page Indicator for Vertical Mode */}
            <div className="fixed bottom-12 right-6 sm:right-12 z-40 px-4 py-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black tracking-widest text-white shadow-2xl">
              {currentPage + 1} <span className="text-zinc-500 mx-1">/</span> {chapter.content.length}
            </div>

            {chapter.content.map((url, i) => (
              <div key={i} ref={el => { imageRefs.current[i] = el; }}>
                <LazyPage 
                  seriesId={series.id}
                  chapterId={chapter.id}
                  pageIndex={i}
                  initialSrc={url || ''}
                  mode="vertical"
                />
              </div>
            ))}
            
            {/* End of Chapter Actions */}
            <div className="m3-section-gap px-4 text-center space-y-8">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" />
              <h2 className="text-3xl font-black tracking-tighter uppercase italic text-zinc-500">End of Chapter</h2>
              
              {/* Tip Creator Section */}
              <div className="bg-zinc-900/50 border border-amber-500/20 rounded-3xl p-8 max-w-md mx-auto space-y-6">
                <div className="flex items-center justify-center gap-3 text-amber-500">
                  <Heart className="w-6 h-6 fill-amber-500" />
                  <h3 className="text-xl font-black uppercase tracking-tight">Support Creator</h3>
                </div>
                <p className="text-sm text-zinc-400">Enjoyed the chapter? Show your appreciation by tipping coins to the creator!</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {[10, 50, 100].map(amount => (
                    <button
                      key={amount}
                      onClick={(e) => { e.stopPropagation(); handleTipCreator(amount); }}
                      className="flex items-center gap-2 px-6 py-3 bg-zinc-950 border border-amber-500/30 hover:bg-amber-500 hover:text-black text-amber-500 font-bold rounded-xl transition-all"
                    >
                      <Coins className="w-4 h-4" /> {amount}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                {prevChapter && (
                  <button 
                    onClick={() => navigate(`/series/${slug}/${prevChapter.chapterNumber}`)}
                    className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white font-black rounded-2xl hover:bg-zinc-800 transition-all border border-white/5 w-full sm:w-auto justify-center"
                  >
                    <ChevronLeft className="w-5 h-5" /> Previous Chapter
                  </button>
                )}
                {nextChapter && (
                  <button 
                    onClick={() => navigate(`/series/${slug}/${nextChapter.chapterNumber}`)}
                    className="flex items-center gap-3 px-12 py-5 bg-emerald-500 text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 w-full sm:w-auto justify-center"
                  >
                    Next Chapter <ChevronRight className="w-5 h-5" />
                  </button>
                )}
                {!nextChapter && (
                  <button 
                    onClick={() => navigate(`/series/${series.slug}`)}
                    className="flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white font-black rounded-2xl hover:bg-zinc-800 transition-all border border-white/5 w-full sm:w-auto justify-center"
                  >
                    Back to Series
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="relative w-full h-full flex items-center justify-center bg-black">
            <LazyPage 
              key={currentPage}
              seriesId={series.id}
              chapterId={chapter.id}
              pageIndex={currentPage}
              initialSrc={chapter.content[currentPage] || ''}
              mode="horizontal"
            />
            {/* Preload next image for smoother reading */}
            {currentPage < chapter.content.length - 1 && (
              <LazyPage 
                seriesId={series.id}
                chapterId={chapter.id}
                pageIndex={currentPage + 1}
                initialSrc={chapter.content[currentPage + 1] || ''}
                mode="preload"
              />
            )}
            
            {/* Navigation Overlays */}
            <div 
              className="absolute left-0 top-0 w-1/3 h-full cursor-pointer z-10 group"
              onClick={(e) => { e.stopPropagation(); setCurrentPage(Math.max(0, currentPage - 1)) }}
            >
              <div className="absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-black/20 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all">
                <ChevronLeft className="w-8 h-8 text-white" />
              </div>
            </div>
            <div 
              className="absolute right-0 top-0 w-1/3 h-full cursor-pointer z-10 group"
              onClick={(e) => { e.stopPropagation(); setCurrentPage(Math.min(chapter.content.length - 1, currentPage + 1)) }}
            >
              <div className="absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-black/20 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all">
                <ChevronRight className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full text-xs font-black tracking-widest text-white z-20 shadow-2xl">
              {currentPage + 1} <span className="text-zinc-500 mx-2">/</span> {chapter.content.length}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation Controls */}
      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: showControls ? 0 : 100 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 px-4 py-6"
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-6">
          <button 
            disabled={!prevChapter}
            onClick={() => navigate(`/series/${slug}/${Number(chapterNum) - 1}`)}
            className="flex-1 flex items-center justify-center gap-3 py-4 bg-zinc-900 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest disabled:opacity-20 hover:bg-zinc-800 transition-all border border-white/5"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          
          <div className="flex-1">
            <div className="relative">
              <select 
                value={chapterNum}
                onChange={(e) => navigate(`/series/${slug}/${e.target.value}`)}
                className="w-full bg-zinc-900 border border-white/5 rounded-[1.5rem] px-6 py-4 text-[10px] font-black uppercase tracking-widest focus:outline-none appearance-none cursor-pointer text-center hover:bg-zinc-800 transition-all"
                dir="auto"
              >
                {chapters.map(c => (
                  <option key={c.id} value={c.chapterNumber}>Chapter {c.chapterNumber} {c.title ? `- ${c.title}` : ''}</option>
                ))}
              </select>
              <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none">
                <List className="w-3 h-3 text-zinc-500" />
              </div>
            </div>
          </div>

          <button 
            disabled={!nextChapter}
            onClick={() => navigate(`/series/${slug}/${Number(chapterNum) + 1}`)}
            className="flex-1 flex items-center justify-center gap-3 py-4 bg-emerald-500 text-black rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest disabled:opacity-20 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Scroll to Top Button */}
      {viewMode === 'vertical' && (
        <motion.button 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: showControls ? 1 : 0, scale: showControls ? 1 : 0.5 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-32 right-8 p-5 bg-emerald-500 text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-40"
        >
          <ArrowUp className="w-6 h-6" />
        </motion.button>
      )}

      {/* Chapter List Sidebar */}
      <AnimatePresence>
        {showSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSidebar(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-zinc-950 border-r border-white/5 z-[70] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-black uppercase tracking-widest text-lg">Chapters</h3>
                <button 
                  onClick={() => setShowSidebar(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {chapters.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      navigate(`/series/${slug}/${c.chapterNumber}`);
                      setShowSidebar(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between ${
                      c.chapterNumber === Number(chapterNum)
                        ? 'bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20'
                        : 'hover:bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span dir="auto">Chapter {c.chapterNumber} {c.title ? `- ${c.title}` : ''}</span>
                    {c.chapterNumber === Number(chapterNum) && <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 ml-2" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Comments Sidebar */}
      <AnimatePresence>
        {showComments && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowComments(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-zinc-950 border-l border-white/5 z-[70] flex flex-col shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-black uppercase tracking-widest text-lg">Comments ({commentsCount})</h3>
                <button 
                  onClick={() => setShowComments(false)}
                  className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <CommentsSection seriesId={series.id} chapterId={chapter.id} isAdmin={profile?.role === 'admin'} />
              </div>
            </motion.div>
          </>
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
