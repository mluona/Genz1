import { c as createLucideIcon, z as useParams, C as useAuth, J as useTheme, B as useNavigate, r as reactExports, y as supabase, R as React, w as jsxRuntimeExports, D as LoginModal, x as motion, K as Menu, A as AnimatePresence, N as Sun, O as Moon, I as Lock, F as ArrowUp, X } from "./index-BNptM8td.js";
import { B as Bookmark, S as Share2, C as CommentsSection } from "./CommentsSection-CpS1HYjo.js";
import { g as getProxiedImageUrl } from "./imageUtils-CO4tJ9Ml.js";
import { C as ChevronLeft } from "./chevron-left-CR3N_r4g.js";
import { S as Settings } from "./settings-CScUw-cZ.js";
import { M as MessageSquare } from "./message-square-Cu1hVUrS.js";
import { C as Coins } from "./coins-Dzew_KuE.js";
import { H as Heart, C as ChevronRight } from "./heart-kEyEscBu.js";
import { L as List } from "./list-CfKH3iED.js";
import { C as Check } from "./check-CALsGMvw.js";
import "./image-Db96004O.js";
import "./formatDistanceToNow-K3QoIsIe.js";
import "./trash-2-C0MAntLE.js";
import "./flame-DkKZUse_.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2Z", key: "169p4p" }],
  ["path", { d: "m9 10 2 2 4-4", key: "1gnqz4" }]
];
const BookmarkCheck = createLucideIcon("bookmark-check", __iconNode$2);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M15 3h6v6", key: "1q9fwt" }],
  ["path", { d: "m21 3-7 7", key: "1l2asr" }],
  ["path", { d: "m3 21 7-7", key: "tjx5ai" }],
  ["path", { d: "M9 21H3v-6", key: "wtvkvv" }]
];
const Maximize2 = createLucideIcon("maximize-2", __iconNode$1);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", key: "afitv7" }],
  ["path", { d: "M3 9h18", key: "1pudct" }],
  ["path", { d: "M9 21V9", key: "1oto5p" }]
];
const PanelsTopLeft = createLucideIcon("panels-top-left", __iconNode);
const LazyPage = ({ seriesId, chapterId, pageIndex, initialSrc, mode = "vertical", onLoaded }) => {
  const proxiedSrc = getProxiedImageUrl(initialSrc) || "";
  const needsProcessing = proxiedSrc && proxiedSrc.startsWith("data:image/");
  const [src, setSrc] = reactExports.useState(needsProcessing ? "" : proxiedSrc);
  const [loading, setLoading] = reactExports.useState(needsProcessing || !proxiedSrc);
  const [isVisible, setIsVisible] = reactExports.useState(mode === "preload" ? true : false);
  const containerRef = reactExports.useRef(null);
  reactExports.useEffect(() => {
    let blobUrl = null;
    if (proxiedSrc) {
      if (proxiedSrc.startsWith("data:image/")) {
        let active = true;
        fetch(proxiedSrc).then((res) => res.blob()).then((blob) => {
          if (active) {
            blobUrl = URL.createObjectURL(blob);
            setSrc(blobUrl);
            setLoading(false);
          }
        }).catch(() => {
          if (active) {
            setSrc(proxiedSrc);
            setLoading(false);
          }
        });
        return () => {
          active = false;
          if (blobUrl) URL.revokeObjectURL(blobUrl);
        };
      } else {
        setSrc(proxiedSrc);
        setLoading(false);
      }
    }
    if (mode === "preload") return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "1000px" });
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    return () => observer.disconnect();
  }, [initialSrc, mode]);
  reactExports.useEffect(() => {
    if (initialSrc || !isVisible) return;
    let isMounted = true;
    let blobUrl = null;
    const fetchPage = async () => {
      try {
        const pageId = `page_${pageIndex.toString().padStart(4, "0")}`;
        const { data, error } = await supabase.from("pages").select("content").eq("seriesId", seriesId).eq("chapterId", chapterId).eq("id", pageId).single();
        if (data && isMounted) {
          const content = data.content;
          const proxiedContent = getProxiedImageUrl(content) || "";
          if (proxiedContent && proxiedContent.startsWith("data:image/")) {
            try {
              const res = await fetch(proxiedContent);
              const blob = await res.blob();
              if (isMounted) {
                blobUrl = URL.createObjectURL(blob);
                setSrc(blobUrl);
              }
            } catch (e) {
              if (isMounted) setSrc(proxiedContent);
            }
          } else if (isMounted) {
            setSrc(proxiedContent);
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
  reactExports.useEffect(() => {
    if (src) {
      console.log(`Page ${pageIndex + 1} src:`, src.substring(0, 100) + (src.length > 100 ? "..." : ""));
    }
  }, [src, pageIndex]);
  if (mode === "preload") {
    return src ? /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src, style: { display: "none" }, referrerPolicy: "no-referrer", alt: "preload next" }) : null;
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { ref: containerRef, className: `relative flex items-center justify-center bg-zinc-950/50 ${mode === "horizontal" ? "w-full h-full" : "w-full min-h-[50vh]"}`, children: [
    loading && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" }) }),
    src && mode === "horizontal" ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.img,
      {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        src,
        alt: `Page ${pageIndex + 1}`,
        className: "max-h-full max-w-full object-contain shadow-2xl",
        loading: "lazy",
        referrerPolicy: "no-referrer",
        onLoad: onLoaded,
        onError: (e) => {
          console.error(`Failed to load image for page ${pageIndex + 1}:`, src.substring(0, 100));
          e.currentTarget.style.display = "none";
        }
      },
      src
    ) : src ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.img,
      {
        initial: { opacity: 0 },
        whileInView: { opacity: 1 },
        viewport: { once: true },
        src,
        alt: `Page ${pageIndex + 1}`,
        className: "w-full h-auto block",
        loading: "lazy",
        referrerPolicy: "no-referrer",
        onLoad: onLoaded,
        onError: (e) => {
          console.error(`Failed to load image for page ${pageIndex + 1}:`, src.substring(0, 100));
          e.currentTarget.style.display = "none";
        }
      },
      src
    ) : null
  ] });
};
const Reader = () => {
  const { slug, chapterNum } = useParams();
  const { user, profile, loading: authLoading } = useAuth();
  const { theme: appTheme, toggleTheme: toggleAppTheme } = useTheme();
  const navigate = useNavigate();
  const [series, setSeries] = reactExports.useState(null);
  const [chapter, setChapter] = reactExports.useState(null);
  const [chapters, setChapters] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [viewMode, setViewMode] = reactExports.useState(() => {
    const saved = localStorage.getItem("readerViewMode");
    return saved || "horizontal";
  });
  const [fontSize, setFontSize] = reactExports.useState(() => Number(localStorage.getItem("readerFontSize")) || 20);
  const [lineHeight, setLineHeight] = reactExports.useState(() => Number(localStorage.getItem("readerLineHeight")) || 1.8);
  const [fontFamily, setFontFamily] = reactExports.useState(() => localStorage.getItem("readerFontFamily") || "serif");
  const [novelTheme, setNovelTheme] = reactExports.useState(() => localStorage.getItem("readerNovelTheme") || "dark");
  const [textAlign, setTextAlign] = reactExports.useState(() => localStorage.getItem("readerTextAlign") || "justify");
  const [paragraphSpacing, setParagraphSpacing] = reactExports.useState(() => localStorage.getItem("readerParagraphSpacing") || "md");
  const [readerLayout, setReaderLayout] = reactExports.useState(() => localStorage.getItem("readerLayout") || "book");
  reactExports.useEffect(() => {
    localStorage.setItem("readerViewMode", viewMode);
    localStorage.setItem("readerFontSize", fontSize.toString());
    localStorage.setItem("readerLineHeight", lineHeight.toString());
    localStorage.setItem("readerFontFamily", fontFamily);
    localStorage.setItem("readerNovelTheme", novelTheme);
    localStorage.setItem("readerTextAlign", textAlign);
    localStorage.setItem("readerParagraphSpacing", paragraphSpacing);
    localStorage.setItem("readerLayout", readerLayout);
  }, [viewMode, fontSize, lineHeight, fontFamily, novelTheme, textAlign, paragraphSpacing, readerLayout]);
  const [currentPage, setCurrentPage] = reactExports.useState(0);
  reactExports.useEffect(() => {
    setCurrentPage(0);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [chapterNum]);
  reactExports.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [chapter == null ? void 0 : chapter.id]);
  const [showControls, setShowControls] = reactExports.useState(true);
  const [isFullscreen, setIsFullscreen] = reactExports.useState(false);
  const [readingProgress, setReadingProgress] = reactExports.useState(0);
  const [isBookmarked, setIsBookmarked] = reactExports.useState(false);
  const [showSidebar, setShowSidebar] = reactExports.useState(false);
  const [toastMessage, setToastMessage] = reactExports.useState(null);
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3e3);
  };
  const [showSettings, setShowSettings] = reactExports.useState(false);
  const [commentsCount, setCommentsCount] = reactExports.useState(0);
  const [showComments, setShowComments] = reactExports.useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!series || !chapter) return;
    const fetchCommentsCount = async () => {
      const { count, error } = await supabase.from("comments").select("*", { count: "exact", head: true }).eq("seriesId", series.id).eq("chapterId", chapter.id);
      if (!error) {
        setCommentsCount(count || 0);
      }
    };
    fetchCommentsCount();
    const channel = supabase.channel(`reader_comments_${chapter.id}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "comments",
      filter: `chapterId=eq.${chapter.id}`
    }, () => {
      fetchCommentsCount();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [series, chapter]);
  const handleShare = async () => {
    const shareText = "شاهد افضل مانجا و الروايات على";
    const shareUrl = "https://genzmanhw.vercel.app/";
    if (navigator.share) {
      try {
        await navigator.share({
          title: "GENZ",
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        console.error("Error sharing:", err);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };
  const copyToClipboard = async () => {
    const text = "شاهد افضل مانجا و الروايات على https://genzmanhw.vercel.app/";
    try {
      if (document.hasFocus()) {
        await navigator.clipboard.writeText(text);
        showToast("تم نسخ الرابط!");
      } else {
        throw new Error("Document not focused");
      }
    } catch (err) {
      console.warn("Navigator clipboard failed, trying fallback", err);
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand("copy");
        showToast("تم نسخ الرابط!");
      } catch (fallbackErr) {
        console.error("Fallback clipboard failed", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };
  const containerRef = reactExports.useRef(null);
  const imageRefs = reactExports.useRef([]);
  reactExports.useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.body.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? window.scrollY / totalHeight * 100 : 0;
      setReadingProgress(progress);
      if (viewMode !== "vertical") return;
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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [viewMode, chapter]);
  const [isPremiumLocked, setIsPremiumLocked] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (!slug || !chapterNum || authLoading) return;
    const fetchSeries = async () => {
      var _a;
      try {
        const { data: seriesData, error: seriesError } = await supabase.from("series").select("*").eq("slug", slug).single();
        if (seriesError) throw seriesError;
        if (seriesData) {
          const s = seriesData;
          setSeries(s);
          const { data: chapterData, error: chapterError } = await supabase.from("chapters").select("*").eq("seriesId", s.id).eq("chapterNumber", Number(chapterNum)).single();
          if (chapterError) throw chapterError;
          if (chapterData) {
            let c = chapterData;
            if (c.isPremium) {
              const isUnlocked = (_a = profile == null ? void 0 : profile.unlockedChapters) == null ? void 0 : _a.includes(c.id);
              if (!isUnlocked) {
                setIsPremiumLocked(true);
                setChapter({ ...c, content: [] });
                setLoading(false);
                return;
              }
            }
            setIsPremiumLocked(false);
            if (s.type !== "Novel") {
              if (!c.content || c.content.length === 0) {
                const { count, error: countError } = await supabase.from("pages").select("*", { count: "exact", head: true }).eq("seriesId", s.id).eq("chapterId", c.id);
                if (!countError) {
                  c.content = Array(count || 0).fill("");
                }
              }
            }
            setChapter(c);
            try {
              const prevChViews = c.views || 0;
              await supabase.from("chapters").update({ views: prevChViews + 1 }).eq("id", c.id);
              await supabase.from("series").update({
                views: (s.views || 0) + 1,
                dailyViews: (s.dailyViews || 0) + 1,
                weeklyViews: (s.weeklyViews || 0) + 1,
                monthlyViews: (s.monthlyViews || 0) + 1
              }).eq("id", s.id);
            } catch (vErr) {
              console.warn("Failed to increment views:", vErr);
            }
            try {
              const localKey = `read_chapters_${(user == null ? void 0 : user.id) || "guest"}`;
              const localRead = JSON.parse(localStorage.getItem(localKey) || "[]");
              if (!localRead.includes(c.id)) {
                localRead.push(c.id);
                localStorage.setItem(localKey, JSON.stringify(localRead));
              }
              const guestRead = JSON.parse(localStorage.getItem("read_chapters_guest") || "[]");
              if (!guestRead.includes(c.id)) {
                guestRead.push(c.id);
                localStorage.setItem("read_chapters_guest", JSON.stringify(guestRead));
              }
              localStorage.setItem(`last_read_${s.id}`, c.id);
            } catch (err) {
              console.error("Failed to update local read history:", err);
            }
            if (user && profile) {
              const currentHistory = profile.history || [];
              const newHistory = currentHistory.filter((h) => h.seriesId !== s.id);
              newHistory.push({
                seriesId: s.id,
                lastChapterId: c.id,
                timestamp: (/* @__PURE__ */ new Date()).toISOString()
              });
              if (newHistory.length > 50) {
                newHistory.shift();
              }
              const currentRead = (profile == null ? void 0 : profile.readChapters) || [];
              const updatedRead = currentRead.includes(c.id) ? currentRead : [...currentRead, c.id];
              await supabase.from("profiles").update({
                history: newHistory,
                readChapters: updatedRead
              }).eq("id", user.id);
            }
          }
          const { data: allChapters, error: allChaptersError } = await supabase.from("chapters").select("id, chapterNumber, title, isPremium, coinPrice").eq("seriesId", s.id).order("chapterNumber", { ascending: true });
          if (!allChaptersError) {
            setChapters(allChapters || []);
          }
        }
      } catch (error) {
        console.error("Error fetching reader data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeries();
  }, [slug, chapterNum, user, authLoading, profile]);
  reactExports.useEffect(() => {
    var _a;
    if (profile && chapter) {
      setIsBookmarked(((_a = profile.bookmarks) == null ? void 0 : _a.includes(chapter.id)) || false);
    }
  }, [profile, chapter]);
  const toggleBookmark = async () => {
    if (!user || !chapter || !profile) return;
    const currentBookmarks = profile.bookmarks || [];
    let newBookmarks;
    if (isBookmarked) {
      newBookmarks = currentBookmarks.filter((id) => id !== chapter.id);
    } else {
      newBookmarks = [...currentBookmarks, chapter.id];
    }
    try {
      const { error } = await supabase.from("profiles").update({ bookmarks: newBookmarks }).eq("id", user.id);
      if (error) throw error;
      setIsBookmarked(!isBookmarked);
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };
  const toggleFullscreen = () => {
    var _a;
    if (!document.fullscreenElement) {
      (_a = containerRef.current) == null ? void 0 : _a.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };
  const readChapterIds = React.useMemo(() => {
    const ids = /* @__PURE__ */ new Set();
    try {
      const userKey = `read_chapters_${(user == null ? void 0 : user.id) || "guest"}`;
      const localRead = JSON.parse(localStorage.getItem(userKey) || "[]");
      localRead.forEach((id) => ids.add(id));
      const guestRead = JSON.parse(localStorage.getItem("read_chapters_guest") || "[]");
      guestRead.forEach((id) => ids.add(id));
    } catch (e) {
    }
    if (profile && profile.readChapters) {
      profile.readChapters.forEach((id) => ids.add(id));
    }
    return ids;
  }, [user, profile]);
  const currentIndex = chapters.findIndex((c) => c.chapterNumber === Number(chapterNum));
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : void 0;
  const nextChapter = currentIndex !== -1 && currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : void 0;
  const handleUnlockChapter = async () => {
    if (!user || !profile) {
      setIsLoginModalOpen(true);
      return;
    }
    if (!chapter || !chapter.coinPrice) return;
    const userCoins = profile.coins || 0;
    if (userCoins < chapter.coinPrice) {
      showToast("ليس لديك عملات كافية! جاري توجيهك إلى الحساب...");
      setTimeout(() => navigate("/profile"), 2e3);
      return;
    }
    try {
      const newUnlocked = [...profile.unlockedChapters || [], chapter.id];
      const { error: profileError } = await supabase.from("profiles").update({
        coins: userCoins - chapter.coinPrice,
        unlockedChapters: newUnlocked
      }).eq("id", user.id);
      if (profileError) throw profileError;
      const { error: transError } = await supabase.from("transactions").insert([{
        userId: user.id,
        amount: -chapter.coinPrice,
        type: "unlock_chapter",
        description: `Unlocked Chapter ${chapter.chapterNumber} of ${series == null ? void 0 : series.title}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        chapterId: chapter.id,
        seriesId: series == null ? void 0 : series.id
      }]);
      if (transError) throw transError;
      setIsPremiumLocked(false);
      if ((series == null ? void 0 : series.type) !== "Novel") {
        const { count, error: countError } = await supabase.from("pages").select("*", { count: "exact", head: true }).eq("seriesId", series == null ? void 0 : series.id).eq("chapterId", chapter.id);
        if (!countError) {
          setChapter({ ...chapter, content: Array(count || 0).fill("") });
        }
      } else {
        const { data: chapterData, error: chapterError } = await supabase.from("chapters").select("*").eq("id", chapter.id).single();
        if (chapterData && !chapterError) {
          setChapter(chapterData);
        }
      }
    } catch (error) {
      console.error("Error unlocking chapter:", error);
      showToast("فشل إلغاء قفل الفصل.");
    }
  };
  const handleTipCreator = async (amount) => {
    if (!user || !profile) {
      setIsLoginModalOpen(true);
      return;
    }
    if ((profile.coins || 0) < amount) {
      showToast("ليس لديك عملات كافية لإرسال الدعم! جاري توجيهك للحساب...");
      setTimeout(() => navigate("/profile"), 2e3);
      return;
    }
    try {
      const { error: profileError } = await supabase.from("profiles").update({
        coins: (profile.coins || 0) - amount
      }).eq("id", user.id);
      if (profileError) throw profileError;
      const { error: transError } = await supabase.from("transactions").insert([{
        userId: user.id,
        amount: -amount,
        type: "support_creator",
        description: `Tipped creator for ${series == null ? void 0 : series.title}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        seriesId: series == null ? void 0 : series.id
      }]);
      if (transError) throw transError;
      showToast(`شكراً لك على دعم الكاتب/المترجم بـ ${amount} عملة!`);
    } catch (error) {
      console.error("Error tipping creator:", error);
      showToast("فشل إرسال الدعم.");
    }
  };
  const getNovelThemeStyles = () => {
    switch (novelTheme) {
      case "light":
        return "bg-zinc-50 text-zinc-900";
      case "sepia":
        return "bg-[#f4ecd8] text-[#5b4636]";
      case "dark":
      default:
        return "bg-zinc-950 text-white";
    }
  };
  const getFontFamilyClass = () => {
    switch (fontFamily) {
      case "sans":
        return "font-sans";
      case "display":
        return "font-display";
      case "mono":
        return "font-mono";
      case "serif":
      default:
        return "font-serif";
    }
  };
  if (loading) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-zinc-950 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" }) });
  if (!series || !chapter) return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-zinc-950 text-white flex items-center justify-center", children: "لم يتم العثور على الفصل" });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
    "div",
    {
      ref: containerRef,
      className: `min-h-screen transition-colors duration-500 ${(series == null ? void 0 : series.type) === "Novel" ? getNovelThemeStyles() : "bg-zinc-950 text-white"}`,
      children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(LoginModal, { isOpen: isLoginModalOpen, onClose: () => setIsLoginModalOpen(false) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { y: -100 },
            animate: { y: showControls ? 0 : -100 },
            className: "fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute bottom-0 left-0 h-0.5 bg-emerald-500 transition-all duration-150", style: { width: `${readingProgress}%` } }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 sm:gap-6", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        setShowSidebar(true);
                      },
                      className: "p-2.5 sm:p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl sm:rounded-2xl transition-all text-zinc-400 hover:text-white",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Menu, { className: "w-5 h-5" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        navigate(`/series/${series.slug}`);
                      },
                      className: "p-2.5 sm:p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl sm:rounded-2xl transition-all group",
                      title: "Back to Series",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-5 h-5 group-hover:-translate-x-1 transition-transform" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "hidden xs:block text-right", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xs sm:text-sm font-black tracking-tight truncate max-w-[120px] sm:max-w-xs", dir: "auto", children: series.title }),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 mt-0.5 justify-start", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-500", children: [
                        "الفصل ",
                        chapter.chapterNumber
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden sm:block w-1 h-1 bg-zinc-700 rounded-full" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden sm:block text-[10px] font-bold text-zinc-500 uppercase tracking-widest truncate max-w-[100px]", dir: "auto", children: chapter.title || "بلا عنوان" })
                    ] })
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 sm:gap-2", children: [
                  series.type === "Novel" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: (e) => {
                          e.stopPropagation();
                          setShowSettings(!showSettings);
                        },
                        className: "p-2.5 sm:p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl sm:rounded-2xl transition-all text-zinc-400 hover:text-white",
                        title: "Reading Settings",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(Settings, { className: "w-4 h-4" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showSettings && /* @__PURE__ */ jsxRuntimeExports.jsx(
                      motion.div,
                      {
                        initial: { opacity: 0, y: 10 },
                        animate: { opacity: 1, y: 0 },
                        exit: { opacity: 0, y: 10 },
                        className: "fixed sm:absolute right-4 sm:right-0 top-20 sm:top-full mt-2 w-[calc(100vw-32px)] sm:w-80 bg-zinc-900 border border-white/10 rounded-3xl p-6 shadow-2xl z-50 text-white",
                        onClick: (e) => e.stopPropagation(),
                        children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-5 text-right custom-scrollbar max-h-[70vh] overflow-y-auto pr-1", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between pb-3 border-b border-white/5", children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-black uppercase tracking-widest text-emerald-500", children: "تخصيص القارئ" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-bold text-zinc-500 uppercase", children: "مظهر مريح للعين" })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2", children: "المظهر الخلفي" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setNovelTheme("dark"), className: `flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${novelTheme === "dark" ? "border-emerald-500 text-emerald-500 bg-emerald-500/10 shadow-lg" : "border-white/5 text-zinc-400 hover:text-white bg-zinc-950/40"}`, children: "داكن" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setNovelTheme("light"), className: `flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${novelTheme === "light" ? "border-emerald-500 text-emerald-500 bg-emerald-500/10 shadow-lg" : "border-white/5 text-zinc-400 hover:text-white bg-zinc-950/40"}`, children: "فاتح" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setNovelTheme("sepia"), className: `flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${novelTheme === "sepia" ? "border-emerald-500 text-emerald-500 bg-emerald-500/10 shadow-lg" : "border-white/5 text-zinc-400 hover:text-white bg-zinc-950/40"}`, children: "ورق قديم" })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2", children: "نوع التنسيق" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setReaderLayout("book"), className: `flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${readerLayout === "book" ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" : "border-white/5 text-zinc-400 hover:text-white bg-zinc-950/40"}`, children: "وضع الكتاب" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setReaderLayout("fullscreen"), className: `flex-1 py-2 rounded-xl border text-xs font-bold transition-all ${readerLayout === "fullscreen" ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" : "border-white/5 text-zinc-400 hover:text-white bg-zinc-950/40"}`, children: "شاشة كاملة" })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2", children: "نوع خط النص" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-2", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFontFamily("serif"), className: `py-2 px-1 rounded-xl border text-[11px] font-serif transition-all ${fontFamily === "serif" ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" : "border-white/5 text-zinc-400 hover:text-white bg-zinc-950/40"}`, children: "أميري (أنيق)" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFontFamily("sans"), className: `py-2 px-1 rounded-xl border text-[11px] font-sans transition-all ${fontFamily === "sans" ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" : "border-white/5 text-zinc-400 hover:text-white bg-zinc-950/40"}`, children: "كايرو (سهل)" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFontFamily("display"), className: `py-2 px-1 rounded-xl border text-[11px] font-display transition-all ${fontFamily === "display" ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" : "border-white/5 text-zinc-400 hover:text-white bg-zinc-950/40"}`, children: "هندسي" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFontFamily("mono"), className: `py-2 px-1 rounded-xl border text-[11px] font-mono transition-all ${fontFamily === "mono" ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" : "border-white/5 text-zinc-400 hover:text-white bg-zinc-950/40"}`, children: "افتراضي" })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2", children: "حجم خط القراءة" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFontSize(Math.max(14, fontSize - 1)), className: "w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center font-bold text-lg border border-white/5 hover:border-white/10", children: "-" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex-1 text-center font-bold font-mono text-sm bg-zinc-950/30 py-2 rounded-xl border border-white/5", children: [
                                fontSize,
                                "px"
                              ] }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setFontSize(Math.min(36, fontSize + 1)), className: "w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center font-bold text-lg border border-white/5 hover:border-white/10", children: "+" })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2", children: "تباعد الأسطر" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setLineHeight(Math.max(1.4, lineHeight - 0.1)), className: "w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center font-bold text-lg border border-white/5 hover:border-white/10", children: "-" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "flex-1 text-center font-bold font-mono text-sm bg-zinc-950/30 py-2 rounded-xl border border-white/5", children: lineHeight.toFixed(1) }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setLineHeight(Math.min(3, lineHeight + 0.1)), className: "w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center font-bold text-lg border border-white/5 hover:border-white/10", children: "+" })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2", children: "محاذاة النص" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTextAlign("justify"), className: `flex-1 py-2 rounded-xl border text-[11px] font-bold transition-all ${textAlign === "justify" ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" : "border-white/5 text-zinc-400 hover:text-white bg-zinc-950/40"}`, children: "ضبط كامل" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTextAlign("right"), className: `flex-1 py-2 rounded-xl border text-[11px] font-bold transition-all ${textAlign === "right" ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" : "border-white/5 text-zinc-400 hover:text-white bg-zinc-950/40"}`, children: "يمين" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setTextAlign("center"), className: `flex-1 py-2 rounded-xl border text-[11px] font-bold transition-all ${textAlign === "center" ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" : "border-white/5 text-zinc-400 hover:text-white bg-zinc-950/40"}`, children: "توسيط" })
                            ] })
                          ] }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
                            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[11px] font-black uppercase tracking-widest text-zinc-400 mb-2", children: "تباعد الفقرات" }),
                            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setParagraphSpacing("sm"), className: `flex-1 py-2 rounded-xl border text-[11px] font-bold transition-all ${paragraphSpacing === "sm" ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" : "border-white/5 text-zinc-400 hover:text-white bg-zinc-950/40"}`, children: "صغير" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setParagraphSpacing("md"), className: `flex-1 py-2 rounded-xl border text-[11px] font-bold transition-all ${paragraphSpacing === "md" ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" : "border-white/5 text-zinc-400 hover:text-white bg-zinc-950/40"}`, children: "متوسط" }),
                              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setParagraphSpacing("lg"), className: `flex-1 py-2 rounded-xl border text-[11px] font-bold transition-all ${paragraphSpacing === "lg" ? "border-emerald-500 text-emerald-500 bg-emerald-500/10" : "border-white/5 text-zinc-400 hover:text-white bg-zinc-950/40"}`, children: "كبير" })
                            ] })
                          ] })
                        ] })
                      }
                    ) })
                  ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-zinc-900 p-1 rounded-xl sm:rounded-2xl border border-white/5", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: (e) => {
                          e.stopPropagation();
                          setViewMode("vertical");
                        },
                        className: `p-2 rounded-lg sm:rounded-xl transition-all ${viewMode === "vertical" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-white"}`,
                        title: "وضع الويب تون (عمودي)",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelsTopLeft, { className: "w-4 h-4" })
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "button",
                      {
                        onClick: (e) => {
                          e.stopPropagation();
                          setViewMode("horizontal");
                        },
                        className: `p-2 rounded-lg sm:rounded-xl transition-all ${viewMode === "horizontal" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-white"}`,
                        title: "وضع الصفحات (أفقي)",
                        children: /* @__PURE__ */ jsxRuntimeExports.jsx(PanelsTopLeft, { className: "w-4 h-4 rotate-90" })
                      }
                    )
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "hidden sm:block h-6 w-px bg-white/5 mx-2" }),
                  user && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        toggleBookmark();
                      },
                      className: `p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all ${isBookmarked ? "bg-emerald-500/20 text-emerald-500" : "bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white"}`,
                      title: isBookmarked ? "Remove Bookmark" : "Bookmark Chapter",
                      children: isBookmarked ? /* @__PURE__ */ jsxRuntimeExports.jsx(BookmarkCheck, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        setShowComments(true);
                      },
                      className: "p-2.5 sm:p-3 bg-zinc-900 hover:bg-zinc-800 rounded-xl sm:rounded-2xl transition-all text-zinc-400 hover:text-white relative",
                      title: "Comments",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-4 h-4" }),
                        commentsCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute -top-1 -right-1 bg-emerald-500 text-black text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center", children: commentsCount > 99 ? "99+" : commentsCount })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        handleShare();
                      },
                      className: "hidden sm:block p-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-all text-zinc-400 hover:text-white",
                      title: "Share Chapter",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        toggleAppTheme();
                      },
                      className: "hidden sm:block p-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-all text-zinc-400 hover:text-white",
                      children: appTheme === "dark" ? /* @__PURE__ */ jsxRuntimeExports.jsx(Sun, { className: "w-4 h-4" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Moon, { className: "w-4 h-4" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        toggleFullscreen();
                      },
                      className: "hidden sm:block p-3 bg-zinc-900 hover:bg-zinc-800 rounded-2xl transition-all text-zinc-400 hover:text-white",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Maximize2, { className: "w-4 h-4" })
                    }
                  )
                ] })
              ] })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "div",
          {
            className: `relative flex flex-col items-center ${(series == null ? void 0 : series.type) === "Novel" || viewMode === "vertical" ? "pt-24 pb-40 min-h-screen" : "h-screen pt-20 pb-0 overflow-hidden"}`,
            onClick: () => setShowControls(!showControls),
            children: isPremiumLocked ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center h-full space-y-6 text-center px-4 w-full max-w-md mx-auto my-auto py-32 text-right", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 mx-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-12 h-12 text-amber-500" }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black uppercase tracking-tighter text-center", children: "فصل بريميوم (مدفوع)" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-400 text-center", children: "يتطلب هذا الفصل عملات لفتحه. ادعم الكاتب/المترجم لمواصلة القراءة الممتعة!" }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    handleUnlockChapter();
                  },
                  className: "flex items-center gap-3 px-8 py-4 bg-amber-500 text-black font-black rounded-2xl hover:scale-105 transition-all shadow-xl shadow-amber-500/20 w-full justify-center mt-4",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "w-5 h-5 animate-pulse" }),
                    " فتح الفصل مقابل ",
                    chapter.coinPrice,
                    " عملة"
                  ]
                }
              )
            ] }) : series.type === "Novel" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl w-full px-4 sm:px-6 py-6 sm:py-12 space-y-8", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `transition-all duration-300 ${readerLayout === "book" ? novelTheme === "sepia" ? "bg-[#faf3e3] border border-[#e8dcc4] shadow-xl rounded-[2rem] p-6 sm:p-12 text-[#4a3b2c]" : novelTheme === "light" ? "bg-white border border-zinc-200 shadow-xl rounded-[2rem] p-6 sm:p-12 text-zinc-950" : "bg-zinc-900/60 border border-white/5 shadow-xl rounded-[2rem] p-6 sm:p-12 text-zinc-100" : ""}`, children: [
                readerLayout === "book" && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "mb-10 pb-6 border-b border-current/10 text-center", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-xl sm:text-2xl font-black mb-3", dir: "auto", children: chapter.title || `الفصل ${chapter.chapterNumber}` }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs opacity-60", children: [
                    "الفصل ",
                    chapter.chapterNumber
                  ] })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "div",
                  {
                    className: `${getFontFamilyClass()} transition-all`,
                    style: {
                      fontSize: `${fontSize}px`,
                      lineHeight,
                      textAlign: textAlign === "justify" ? "justify" : textAlign
                    },
                    dir: "auto",
                    children: (() => {
                      const rawContent = chapter.content.join("\n\n");
                      const paragraphs = rawContent.split(/\n+/).map((p) => p.trim()).filter((p) => p.length > 0);
                      const spacingClass = paragraphSpacing === "sm" ? "mb-4" : paragraphSpacing === "lg" ? "mb-9" : "mb-6";
                      return paragraphs.map((p, index) => /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `${spacingClass} last:mb-0 leading-relaxed text-justify-inter`, children: p }, index));
                    })()
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "m3-section-gap text-center space-y-8", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black tracking-tighter uppercase italic text-zinc-500", children: "نهاية الفصل" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-zinc-900/50 border border-amber-500/20 rounded-3xl p-8 max-w-md mx-auto space-y-6 text-right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 text-amber-500", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-6 h-6 fill-amber-500 animate-pulse" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-black uppercase tracking-tight text-center", children: "ادعم الكاتب/المترجم" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-zinc-400 text-center", children: "هل أعجبك هذا الفصل؟ أظهر دعمك عن طريق إرسال بعض العملات للكاتب/المترجم!" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap justify-center gap-3", children: [10, 50, 100].map((amount) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        handleTipCreator(amount);
                      },
                      className: "flex items-center gap-2 px-6 py-3 bg-zinc-950 border border-amber-500/30 hover:bg-amber-500 hover:text-black text-amber-500 font-bold rounded-xl transition-all font-mono",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "w-4 h-4" }),
                        " ",
                        amount
                      ]
                    },
                    amount
                  )) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row-reverse gap-6 justify-center items-center", children: [
                  nextChapter && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => navigate(`/series/${slug}/${nextChapter.chapterNumber}`),
                      className: "flex items-center gap-3 px-12 py-5 bg-emerald-500 text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 w-full sm:w-auto justify-center",
                      children: [
                        "الفصل التالي ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-5 h-5 rotate-180" })
                      ]
                    }
                  ),
                  prevChapter && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => navigate(`/series/${slug}/${prevChapter.chapterNumber}`),
                      className: "flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white font-black rounded-2xl hover:bg-zinc-800 transition-all border border-white/5 w-full sm:w-auto justify-center",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-5 h-5 rotate-180" }),
                        " الفصل السابق"
                      ]
                    }
                  ),
                  !nextChapter && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => navigate(`/series/${series.slug}`),
                      className: "flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white font-black rounded-2xl hover:bg-zinc-800 transition-all border border-white/5 w-full sm:w-auto justify-center",
                      children: "العودة للتفاصيل"
                    }
                  )
                ] })
              ] })
            ] }) : viewMode === "vertical" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl w-full shadow-2xl relative", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-12 right-6 sm:right-12 z-40 px-4 py-2 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black tracking-widest text-white shadow-2xl", children: [
                currentPage + 1,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-500 mx-1", children: "/" }),
                " ",
                chapter.content.length
              ] }),
              chapter.content.map((url, i) => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { ref: (el) => {
                imageRefs.current[i] = el;
              }, children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                LazyPage,
                {
                  seriesId: series.id,
                  chapterId: chapter.id,
                  pageIndex: i,
                  initialSrc: url || "",
                  mode: "vertical"
                }
              ) }, i)),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "m3-section-gap px-4 text-center space-y-8", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "h-px w-full bg-gradient-to-r from-transparent via-zinc-800 to-transparent" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-3xl font-black tracking-tighter uppercase italic text-zinc-500", children: "نهاية الفصل" }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-zinc-900/50 border border-amber-500/20 rounded-3xl p-8 max-w-md mx-auto space-y-6 text-right", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-center gap-3 text-amber-500", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Heart, { className: "w-6 h-6 fill-amber-500" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-black uppercase tracking-tight text-center", children: "ادعم الكاتب/المترجم" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-zinc-400 text-center", children: "هل أعجبك هذا الفصل؟ أظهر دعمك عن طريق إرسال بعض العملات للكاتب/المترجم!" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-wrap justify-center gap-3 font-mono", children: [10, 50, 100].map((amount) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: (e) => {
                        e.stopPropagation();
                        handleTipCreator(amount);
                      },
                      className: "flex items-center gap-2 px-6 py-3 bg-zinc-950 border border-amber-500/30 hover:bg-amber-500 hover:text-black text-amber-500 font-bold rounded-xl transition-all",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "w-4 h-4" }),
                        " ",
                        amount
                      ]
                    },
                    amount
                  )) })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row-reverse gap-6 justify-center items-center", children: [
                  nextChapter && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => navigate(`/series/${slug}/${nextChapter.chapterNumber}`),
                      className: "flex items-center gap-3 px-12 py-5 bg-emerald-500 text-black font-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/20 w-full sm:w-auto justify-center",
                      children: [
                        "الفصل التالي ",
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-5 h-5 rotate-180" })
                      ]
                    }
                  ),
                  prevChapter && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => navigate(`/series/${slug}/${prevChapter.chapterNumber}`),
                      className: "flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white font-black rounded-2xl hover:bg-zinc-800 transition-all border border-white/5 w-full sm:w-auto justify-center",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-5 h-5 rotate-180" }),
                        " الفصل السابق"
                      ]
                    }
                  ),
                  !nextChapter && /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => navigate(`/series/${series.slug}`),
                      className: "flex items-center gap-3 px-8 py-4 bg-zinc-900 text-white font-black rounded-2xl hover:bg-zinc-800 transition-all border border-white/5 w-full sm:w-auto justify-center",
                      children: "العودة للتفاصيل"
                    }
                  )
                ] })
              ] })
            ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full h-full flex items-center justify-center bg-black", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                LazyPage,
                {
                  seriesId: series.id,
                  chapterId: chapter.id,
                  pageIndex: currentPage,
                  initialSrc: chapter.content[currentPage] || "",
                  mode: "horizontal"
                },
                currentPage
              ),
              currentPage < chapter.content.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx(
                LazyPage,
                {
                  seriesId: series.id,
                  chapterId: chapter.id,
                  pageIndex: currentPage + 1,
                  initialSrc: chapter.content[currentPage + 1] || "",
                  mode: "preload"
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute left-0 top-0 w-1/3 h-full cursor-pointer z-10 group",
                  onClick: (e) => {
                    e.stopPropagation();
                    setCurrentPage(Math.max(0, currentPage - 1));
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-8 top-1/2 -translate-y-1/2 p-4 bg-black/20 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-8 h-8 text-white" }) })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "div",
                {
                  className: "absolute right-0 top-0 w-1/3 h-full cursor-pointer z-10 group",
                  onClick: (e) => {
                    e.stopPropagation();
                    setCurrentPage(Math.min(chapter.content.length - 1, currentPage + 1));
                  },
                  children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute right-8 top-1/2 -translate-y-1/2 p-4 bg-black/20 backdrop-blur-md rounded-full opacity-0 group-hover:opacity-100 transition-all", children: /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-8 h-8 text-white" }) })
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "absolute bottom-12 left-1/2 -translate-x-1/2 px-6 py-3 bg-zinc-900/80 backdrop-blur-xl border border-white/10 rounded-full text-xs font-black tracking-widest text-white z-20 shadow-2xl", children: [
                currentPage + 1,
                " ",
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-500 mx-2", children: "/" }),
                " ",
                chapter.content.length
              ] })
            ] })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { y: 100 },
            animate: { y: showControls ? 0 : 100 },
            className: "fixed bottom-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-t border-white/5 px-4 py-4 sm:py-6",
            children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-3xl mx-auto flex items-center justify-between gap-2 sm:gap-6", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  disabled: !prevChapter,
                  onClick: (e) => {
                    e.stopPropagation();
                    if (prevChapter) navigate(`/series/${slug}/${prevChapter.chapterNumber}`);
                  },
                  className: "flex-1 flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 bg-zinc-900 rounded-xl sm:rounded-[1.5rem] font-black text-[9px] sm:text-[10px] uppercase tracking-widest disabled:opacity-20 hover:bg-zinc-800 transition-all border border-white/5",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronLeft, { className: "w-4 h-4 rotate-180" }),
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden xs:inline", children: "السابق" })
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-[2] sm:flex-1", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  "select",
                  {
                    value: chapterNum,
                    onChange: (e) => navigate(`/series/${slug}/${e.target.value}`),
                    className: "w-full bg-zinc-900 border border-white/5 rounded-xl sm:rounded-[1.5rem] px-4 sm:px-6 py-3 sm:py-4 text-[9px] sm:text-[10px] font-black uppercase tracking-widest focus:outline-none appearance-none cursor-pointer text-center hover:bg-zinc-800 transition-all text-right",
                    dir: "auto",
                    children: chapters.map((c) => /* @__PURE__ */ jsxRuntimeExports.jsxs("option", { value: c.chapterNumber, children: [
                      "الفصل ",
                      c.chapterNumber,
                      " ",
                      c.title ? `- ${c.title}` : ""
                    ] }, c.id))
                  }
                ),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 pointer-events-none", children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "w-3 h-3 text-zinc-500" }) })
              ] }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  disabled: !nextChapter,
                  onClick: (e) => {
                    e.stopPropagation();
                    if (nextChapter) navigate(`/series/${slug}/${nextChapter.chapterNumber}`);
                  },
                  className: "flex-1 flex items-center justify-center gap-2 sm:gap-3 py-3 sm:py-4 bg-emerald-500 text-black rounded-xl sm:rounded-[1.5rem] font-black text-[9px] sm:text-[10px] uppercase tracking-widest disabled:opacity-20 hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20",
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "hidden xs:inline", children: "التالي" }),
                    " ",
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronRight, { className: "w-4 h-4 rotate-180" })
                  ]
                }
              )
            ] })
          }
        ),
        viewMode === "vertical" && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.button,
          {
            initial: { opacity: 0, scale: 0.5 },
            animate: { opacity: showControls ? 1 : 0, scale: showControls ? 1 : 0.5 },
            onClick: () => window.scrollTo({ top: 0, behavior: "smooth" }),
            className: "fixed bottom-32 right-8 p-5 bg-emerald-500 text-black rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all z-40",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "w-6 h-6" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showSidebar && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              onClick: () => setShowSidebar(false),
              className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { x: "-100%" },
              animate: { x: 0 },
              exit: { x: "-100%" },
              transition: { type: "spring", damping: 25, stiffness: 200 },
              className: "fixed top-0 left-0 bottom-0 w-80 bg-zinc-950 border-r border-white/5 z-[70] flex flex-col shadow-2xl",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-white/5 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-black uppercase tracking-widest text-[16px]", children: "قائمة الفصول" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setShowSidebar(false),
                      className: "p-2 hover:bg-white/5 rounded-xl transition-colors",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar", children: chapters.map((c) => {
                  const isCurrent = c.chapterNumber === Number(chapterNum);
                  const isRead = readChapterIds.has(c.id);
                  return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      onClick: () => {
                        navigate(`/series/${slug}/${c.chapterNumber}`);
                        setShowSidebar(false);
                      },
                      className: `w-full text-right px-4 py-3 rounded-xl transition-all flex items-center justify-between gap-2 ${isCurrent ? "bg-emerald-500/20 text-emerald-400 font-black border border-emerald-500/40 shadow-sm" : isRead ? "bg-emerald-500/[0.04] text-zinc-300 border border-emerald-500/10 hover:bg-emerald-500/10" : "hover:bg-white/5 text-zinc-400 hover:text-white border border-transparent"}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 min-w-0", children: [
                          isRead && /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3.5 h-3.5 text-emerald-400 shrink-0" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { dir: "auto", className: "truncate", children: [
                            "الفصل ",
                            c.chapterNumber,
                            " ",
                            c.title ? `- ${c.title}` : ""
                          ] })
                        ] }),
                        isCurrent && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-2 h-2 rounded-full bg-emerald-400 shrink-0 mr-2 animate-pulse" })
                      ]
                    },
                    c.id
                  );
                }) })
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: showComments && /* @__PURE__ */ jsxRuntimeExports.jsxs(jsxRuntimeExports.Fragment, { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            motion.div,
            {
              initial: { opacity: 0 },
              animate: { opacity: 1 },
              exit: { opacity: 0 },
              onClick: () => setShowComments(false),
              className: "fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            motion.div,
            {
              initial: { x: "100%" },
              animate: { x: 0 },
              exit: { x: "100%" },
              transition: { type: "spring", damping: 25, stiffness: 200 },
              className: "fixed top-0 right-0 bottom-0 w-full sm:w-96 bg-zinc-950 border-l border-white/5 z-[70] flex flex-col shadow-2xl",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-white/5 flex items-center justify-between", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "font-black uppercase tracking-widest text-[16px]", children: [
                    "التعليقات (",
                    commentsCount,
                    ")"
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      onClick: () => setShowComments(false),
                      className: "p-2 hover:bg-white/5 rounded-xl transition-colors",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex-1 overflow-y-auto p-4 custom-scrollbar", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CommentsSection, { seriesId: series.id, chapterId: chapter.id, isAdmin: (profile == null ? void 0 : profile.role) === "admin" }) })
              ]
            }
          )
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: toastMessage && /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 50, x: "-50%" },
            animate: { opacity: 1, y: 0, x: "-50%" },
            exit: { opacity: 0, y: 50, x: "-50%" },
            className: "fixed bottom-24 left-1/2 z-[100] px-6 py-3 bg-zinc-900 border border-white/10 text-white rounded-full shadow-2xl font-bold text-sm whitespace-nowrap",
            children: toastMessage
          }
        ) })
      ]
    }
  );
};
export {
  Reader
};
