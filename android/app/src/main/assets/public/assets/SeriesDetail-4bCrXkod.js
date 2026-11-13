import { c as createLucideIcon, z as useParams, B as useNavigate, C as useAuth, r as reactExports, R as React, y as supabase, w as jsxRuntimeExports, L as Link, D as LoginModal, x as motion, E as Bell, F as ArrowUp, G as Search, I as Lock, A as AnimatePresence } from "./index-BNptM8td.js";
import { B as Bookmark, S as Share2, C as CommentsSection } from "./CommentsSection-CpS1HYjo.js";
import { f as formatRelativeArabicDate } from "./dateUtils-BpVYGPxh.js";
import { g as getProxiedImageUrl } from "./imageUtils-CO4tJ9Ml.js";
import { S as SeriesCard } from "./SeriesCard-CASsyDfU.js";
import { B as BellRing } from "./bell-ring-DFTUPiuS.js";
import { P as Play } from "./play-DDvLS1ez.js";
import { L as Layers } from "./layers-DLmq4yKN.js";
import { S as Star } from "./star-Dlimeg9j.js";
import { E as Eye } from "./eye-Dt8TQbSX.js";
import { A as ArrowDown } from "./arrow-down-8kruHUpR.js";
import { T as Tag } from "./tag-CQn2tcc2.js";
import { C as Check } from "./check-CALsGMvw.js";
import { C as ChevronRight } from "./heart-kEyEscBu.js";
import "./message-square-Cu1hVUrS.js";
import "./image-Db96004O.js";
import "./formatDistanceToNow-K3QoIsIe.js";
import "./trash-2-C0MAntLE.js";
import "./flame-DkKZUse_.js";
import "./clock-BUWQYWD4.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  ["path", { d: "m21 16-4 4-4-4", key: "f6ql7i" }],
  ["path", { d: "M17 20V4", key: "1ejh1v" }],
  ["path", { d: "m3 8 4-4 4 4", key: "11wl7u" }],
  ["path", { d: "M7 4v16", key: "1glfcx" }]
];
const ArrowUpDown = createLucideIcon("arrow-up-down", __iconNode$5);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [["path", { d: "m6 9 6 6 6-6", key: "qrunsl" }]];
const ChevronDown = createLucideIcon("chevron-down", __iconNode$4);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["circle", { cx: "12", cy: "12", r: "1", key: "41hilf" }],
  ["circle", { cx: "19", cy: "12", r: "1", key: "1wjl8i" }],
  ["circle", { cx: "5", cy: "12", r: "1", key: "1pcz8c" }]
];
const Ellipsis = createLucideIcon("ellipsis", __iconNode$3);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["rect", { width: "18", height: "11", x: "3", y: "11", rx: "2", ry: "2", key: "1w4ew1" }],
  ["path", { d: "M7 11V7a5 5 0 0 1 9.9-1", key: "1mm8w8" }]
];
const LockOpen = createLucideIcon("lock-open", __iconNode$2);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  [
    "path",
    {
      d: "M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z",
      key: "e79jfc"
    }
  ],
  ["circle", { cx: "13.5", cy: "6.5", r: ".5", fill: "currentColor", key: "1okk4w" }],
  ["circle", { cx: "17.5", cy: "10.5", r: ".5", fill: "currentColor", key: "f64h9f" }],
  ["circle", { cx: "6.5", cy: "12.5", r: ".5", fill: "currentColor", key: "qy21gx" }],
  ["circle", { cx: "8.5", cy: "7.5", r: ".5", fill: "currentColor", key: "fotxhn" }]
];
const Palette = createLucideIcon("palette", __iconNode$1);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M13 21h8", key: "1jsn5i" }],
  [
    "path",
    {
      d: "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z",
      key: "1a8usu"
    }
  ]
];
const PenLine = createLucideIcon("pen-line", __iconNode);
const GENRE_TRANSLATIONS = {
  "Action": "أكشن",
  "Adventure": "مغامرة",
  "Comedy": "كوميدي",
  "Drama": "دراما",
  "Fantasy": "خيالي",
  "Horror": "رعب",
  "Mystery": "غموض",
  "Psychological": "نفسي",
  "Romance": "رومانسي",
  "Sci-Fi": "خيال علمي",
  "Slice of Life": "شريحة من الحياة",
  "Sports": "رياضي",
  "Supernatural": "قوى خارقة",
  "Thriller": "إثارة",
  "Chinese": "صينية",
  "Korean": "كورية",
  "Japanese": "يابانية",
  "Magic": "سحر",
  "Time Travel": "إعادة زمن",
  "Isekai": "ايسكاي",
  "Martial Arts": "فنون قتالية",
  "Reincarnation": "إعادة تجسيد",
  "Cultivation": "زراعة قوى",
  "Video Games": "ألعاب فيديو",
  "Leveling": "تطوير المستوى",
  "System": "نظام",
  "Academy": "أكاديمية",
  "Tower": "برج",
  "Dungeons": "دهاليز"
};
const SeriesDetail = () => {
  var _a;
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();
  const [series, setSeries] = reactExports.useState(null);
  const [chapters, setChapters] = reactExports.useState([]);
  const [commentsCount, setCommentsCount] = reactExports.useState(0);
  const [loading, setLoading] = reactExports.useState(true);
  const [activeTab, setActiveTab] = reactExports.useState("chapters");
  const [isFavorite, setIsFavorite] = reactExports.useState(false);
  const [isSubscribed, setIsSubscribed] = reactExports.useState(false);
  const [toastMessage, setToastMessage] = reactExports.useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = reactExports.useState(false);
  const [similarWorks, setSimilarWorks] = reactExports.useState([]);
  const [isRatingModalOpen, setIsRatingModalOpen] = reactExports.useState(false);
  const [selectedStars, setSelectedStars] = reactExports.useState(5);
  const [hoveredStars, setHoveredStars] = reactExports.useState(null);
  const [hasRated, setHasRated] = reactExports.useState(false);
  const [isSynopsisExpanded, setIsSynopsisExpanded] = reactExports.useState(false);
  const [chapterSearch, setChapterSearch] = reactExports.useState("");
  const [chapterSort, setChapterSort] = reactExports.useState("desc");
  reactExports.useEffect(() => {
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
      const { error } = await supabase.from("series").update({
        rating: newAverage,
        ratingCount: newCount
      }).eq("id", series.id);
      if (error) throw error;
      setSeries({
        ...series,
        rating: newAverage,
        ratingCount: newCount
      });
      setHasRated(true);
      localStorage.setItem(`hasRated_${series.id}`, "true");
      showToast("شكراً لك على تقييمك!");
    } catch (err) {
      console.error("Error submitting rating:", err);
      showToast("فشل إرسال التقييم");
    } finally {
      setIsRatingModalOpen(false);
    }
  };
  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3e3);
  };
  reactExports.useEffect(() => {
    var _a2;
    if (series) {
      if (profile) {
        setIsFavorite(((_a2 = profile.favorites) == null ? void 0 : _a2.includes(series.id)) || false);
        const profileSubs = (profile == null ? void 0 : profile.subscribedSeries) || [];
        const localSub = localStorage.getItem(`sub_${(user == null ? void 0 : user.id) || "guest"}_${series.id}`) === "true";
        setIsSubscribed(profileSubs.includes(series.id) || localSub);
      } else {
        const localSub = localStorage.getItem(`sub_guest_${series.id}`) === "true";
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
    localStorage.setItem(`sub_${user.id}_${series.id}`, nextState ? "true" : "false");
    let currentSubscribedSeries = (profile == null ? void 0 : profile.subscribedSeries) || [];
    if (nextState) {
      if (!currentSubscribedSeries.includes(series.id)) {
        currentSubscribedSeries = [...currentSubscribedSeries, series.id];
      }
    } else {
      currentSubscribedSeries = currentSubscribedSeries.filter((id) => id !== series.id);
    }
    try {
      await supabase.from("profiles").update({ subscribedSeries: currentSubscribedSeries }).eq("id", user.id);
      await refreshProfile(user.id);
      showToast(
        nextState ? "تم تفعيل التنبيهات! ستصلك إشعارات فورية عند تنزيل فصل جديد." : "تم إلغاء تفعيل التنبيهات لهذا العمل."
      );
    } catch (error) {
      console.error("Error updating notification subscription:", error);
      showToast(
        nextState ? "تم تفعيل التنبيهات لهذا العمل!" : "تم إلغاء تفعيل التنبيهات لهذا العمل."
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
    let newFavorites = [...profile.favorites || []];
    if (wasFavorite) {
      newFavorites = newFavorites.filter((id) => id !== series.id);
    } else {
      newFavorites.push(series.id);
    }
    try {
      const { error } = await supabase.from("profiles").update({ favorites: newFavorites }).eq("id", user.id);
      if (error) throw error;
      showToast(wasFavorite ? "تمت الإزالة من المكتبة" : "تمت الإضافة للمكتبة");
      await refreshProfile(user.id);
    } catch (error) {
      console.error("Error updating favorites:", error);
      setIsFavorite(wasFavorite);
      showToast("فشلت الإضافة إلى المكتبة");
    }
  };
  const handleShare = async () => {
    const shareText = `اقرأ ${(series == null ? void 0 : series.title) || ""} على GENZ`;
    const shareUrl = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: (series == null ? void 0 : series.title) || "GENZ",
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
    const text = window.location.href;
    try {
      if (document.hasFocus()) {
        await navigator.clipboard.writeText(text);
        showToast("تم نسخ رابط العمل!");
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
        showToast("تم نسخ رابط العمل!");
      } catch (fallbackErr) {
        console.error("Fallback clipboard failed", fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };
  const readChapterIds = React.useMemo(() => {
    const ids = /* @__PURE__ */ new Set();
    if (!series) return ids;
    if (profile && profile.readChapters) {
      profile.readChapters.forEach((id) => ids.add(id));
    }
    if (profile && profile.history) {
      profile.history.forEach((h) => {
        if (h.seriesId === series.id && h.lastChapterId) {
          ids.add(h.lastChapterId);
        }
      });
    }
    try {
      const userKey = `read_chapters_${(user == null ? void 0 : user.id) || "guest"}`;
      const localRead = JSON.parse(localStorage.getItem(userKey) || "[]");
      localRead.forEach((id) => ids.add(id));
      const guestRead = JSON.parse(localStorage.getItem("read_chapters_guest") || "[]");
      guestRead.forEach((id) => ids.add(id));
    } catch (e) {
    }
    return ids;
  }, [series, profile, user]);
  const lastReadChapterId = React.useMemo(() => {
    if (!series) return null;
    if (profile && profile.history) {
      const hist = profile.history.find((h) => h.seriesId === series.id);
      if (hist == null ? void 0 : hist.lastChapterId) return hist.lastChapterId;
    }
    try {
      const localLast = localStorage.getItem(`last_read_${series.id}`);
      if (localLast) return localLast;
    } catch (e) {
    }
    return null;
  }, [series, profile]);
  const lastReadChapter = React.useMemo(() => {
    if (!lastReadChapterId || chapters.length === 0) return null;
    return chapters.find((c) => c.id === lastReadChapterId) || null;
  }, [lastReadChapterId, chapters]);
  const filteredAndSortedChapters = React.useMemo(() => {
    const q = chapterSearch.trim().toLowerCase();
    const list = q ? chapters.filter((ch) => {
      const numStr = String(ch.chapterNumber);
      const titleStr = (ch.title || "").toLowerCase();
      return numStr.includes(q) || titleStr.includes(q);
    }) : [...chapters];
    list.sort(
      (a, b) => chapterSort === "desc" ? b.chapterNumber - a.chapterNumber : a.chapterNumber - b.chapterNumber
    );
    return list;
  }, [chapters, chapterSearch, chapterSort]);
  const readCountInSeries = React.useMemo(() => {
    if (chapters.length === 0 || readChapterIds.size === 0) return 0;
    return chapters.filter((ch) => readChapterIds.has(ch.id)).length;
  }, [chapters, readChapterIds]);
  reactExports.useEffect(() => {
    if (!slug) return;
    const fetchSeries = async () => {
      try {
        const { data, error } = await supabase.from("series").select("*").eq("slug", slug).single();
        if (error) throw error;
        setSeries(data);
      } catch (error) {
        console.error("Error fetching series:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSeries();
    const channel = supabase.channel(`series_${slug}`).on("postgres_changes", { event: "*", schema: "public", table: "series", filter: `slug=eq.${slug}` }, (payload) => {
      setSeries(payload.new);
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [slug]);
  reactExports.useEffect(() => {
    if (!series) return;
    const fetchChaptersAndComments = async () => {
      try {
        const { data: chaptersData } = await supabase.from("chapters").select("id, seriesId, chapterNumber, title, publishDate, isPremium, coinPrice, views").eq("seriesId", series.id).order("chapterNumber", { ascending: false });
        if (chaptersData) setChapters(chaptersData);
        const { count } = await supabase.from("comments").select("*", { count: "exact", head: true }).eq("seriesId", series.id).is("chapterId", null);
        setCommentsCount(count || 0);
      } catch (error) {
        console.error("Error fetching chapters/comments:", error);
      }
    };
    const fetchSimilarWorks = async () => {
      try {
        const { data } = await supabase.from("series").select("id, title, coverImage, type, author, genres, rating, ratingCount, slug, status, description").neq("id", series.id).limit(100);
        if (data) {
          const filtered = data.filter((item) => item.id !== series.id).map((item) => {
            let score = 0;
            const genreOverlap = item.genres.filter((g) => series.genres.includes(g)).length;
            score += genreOverlap * 5;
            if (item.author && series.author && item.author === series.author) {
              score += 10;
            }
            if (item.title && series.title) {
              const titleWords = series.title.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
              const itemTitleLower = item.title.toLowerCase();
              const titleMatch = titleWords.filter((w) => itemTitleLower.includes(w)).length;
              score += titleMatch * 3;
            }
            if (item.description && series.description) {
              const descWords = series.description.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
              const itemDescLower = item.description.toLowerCase();
              const descMatch = descWords.filter((w) => itemDescLower.includes(w)).length;
              score += descMatch * 1;
            }
            if (score === 0) {
              score = Math.random() * 0.1;
            }
            return { item, score };
          }).sort((a, b) => b.score - a.score).map((x) => x.item).slice(0, 10);
          setSimilarWorks(filtered);
        }
      } catch (error) {
        console.error("Error fetching similar works:", error);
      }
    };
    fetchChaptersAndComments();
    fetchSimilarWorks();
    const chaptersChannel = supabase.channel(`chapters_${series.id}`).on("postgres_changes", { event: "*", schema: "public", table: "chapters", filter: `seriesId=eq.${series.id}` }, () => {
      fetchChaptersAndComments();
    }).subscribe();
    return () => {
      supabase.removeChannel(chaptersChannel);
    };
  }, [series]);
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-zinc-950 flex items-center justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" }) });
  }
  if (!series) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-zinc-950 text-white flex flex-col items-center justify-center gap-4 px-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-lg font-bold text-zinc-300", children: "لم يتم العثور على العمل المطلوب" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        Link,
        {
          to: "/",
          className: "px-5 py-2.5 rounded-xl bg-emerald-500 text-black text-sm font-bold hover:bg-emerald-400 transition-colors",
          children: "العودة للرئيسية"
        }
      )
    ] });
  }
  const statusLabel = series.status === "Ongoing" ? "مستمر" : series.status === "Completed" ? "مكتمل" : series.status === "Hiatus" ? "متوقف مؤقتاً" : series.status === "Dropped" ? "متوقف" : series.status;
  const descriptionText = ((_a = series.description) == null ? void 0 : _a.trim()) || "";
  const isLongSynopsis = descriptionText.length > 280;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-zinc-950 text-white pb-20 selection:bg-emerald-500 selection:text-black relative overflow-x-hidden", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoginModal, { isOpen: isLoginModalOpen, onClose: () => setIsLoginModalOpen(false) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-12 gap-7 lg:gap-10 items-start", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
            className: "lg:col-span-4 w-full max-w-[340px] mx-auto lg:max-w-none",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-zinc-900", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
              "img",
              {
                src: getProxiedImageUrl(series.coverImage),
                alt: series.title,
                className: "w-full h-full object-cover",
                referrerPolicy: "no-referrer"
              }
            ) })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          motion.div,
          {
            initial: { opacity: 0, y: 14 },
            animate: { opacity: 1, y: 0 },
            transition: { duration: 0.4, delay: 0.06, ease: [0.16, 1, 0.3, 1] },
            className: "lg:col-span-8 space-y-5 text-right min-w-0",
            children: [
              series.genres && series.genres.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-sm font-medium text-zinc-400 leading-relaxed", children: series.genres.map((genre, index) => /* @__PURE__ */ jsxRuntimeExports.jsxs(React.Fragment, { children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Link,
                  {
                    to: `/library?genre=${encodeURIComponent(genre)}`,
                    className: "hover:text-emerald-400 transition-colors",
                    children: GENRE_TRANSLATIONS[genre] || genre
                  }
                ),
                index < series.genres.length - 1 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "، " })
              ] }, genre)) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "h1",
                {
                  className: "text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white leading-tight text-balance",
                  dir: "auto",
                  children: series.title
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3 pt-1", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: toggleFavorite,
                      className: `flex-1 min-h-[48px] px-5 py-3 rounded-full text-sm font-bold transition-colors flex items-center justify-between gap-3 cursor-pointer border ${isFavorite ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40" : "bg-white/[0.06] hover:bg-white/[0.1] text-white border-white/10"}`,
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-2.5", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: `w-4 h-4 ${isFavorite ? "fill-current" : ""}` }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: isFavorite ? "في المكتبة" : "أضف للمكتبة" })
                        ] }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ChevronDown, { className: "w-4 h-4 text-zinc-400" })
                      ]
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: toggleNotificationSubscription,
                      "aria-label": isSubscribed ? "إلغاء تفعيل التنبيهات" : "تفعيل التنبيه عند نزول فصل جديد",
                      title: isSubscribed ? "إلغاء تفعيل التنبيهات" : "تفعيل التنبيه عند نزول فصل جديد",
                      className: `w-12 h-12 rounded-2xl transition-colors flex items-center justify-center cursor-pointer shrink-0 border ${isSubscribed ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/40" : "bg-white/[0.06] hover:bg-white/[0.1] text-zinc-300 hover:text-white border-white/10"}`,
                      children: isSubscribed ? /* @__PURE__ */ jsxRuntimeExports.jsx(BellRing, { className: "w-5 h-5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-5 h-5" })
                    }
                  ),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "button",
                    {
                      type: "button",
                      onClick: handleShare,
                      "aria-label": "مشاركة العمل",
                      title: "مشاركة العمل",
                      className: "w-12 h-12 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-zinc-300 hover:text-white transition-colors flex items-center justify-center cursor-pointer shrink-0",
                      children: /* @__PURE__ */ jsxRuntimeExports.jsx(Share2, { className: "w-5 h-5" })
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    type: "button",
                    disabled: chapters.length === 0,
                    onClick: () => {
                      if (chapters.length === 0) return;
                      if (lastReadChapter) {
                        navigate(`/series/${series.slug}/${lastReadChapter.chapterNumber}`);
                      } else {
                        const firstChapter = chapters[chapters.length - 1];
                        navigate(`/series/${series.slug}/${firstChapter.chapterNumber}`);
                      }
                    },
                    className: "w-full min-h-[48px] px-6 py-3 rounded-full bg-white/[0.07] hover:bg-emerald-500 hover:text-black disabled:opacity-40 disabled:cursor-not-allowed border border-white/10 hover:border-emerald-500 text-white font-bold text-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] cursor-pointer",
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx(Play, { className: "w-4 h-4 fill-current" }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: lastReadChapter ? `متابعة القراءة · الفصل ${lastReadChapter.chapterNumber}` : chapters.length > 0 ? "ابدأ القراءة" : "لا توجد فصول بعد" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-start gap-x-4 gap-y-4 pt-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(PenLine, { className: "w-3.5 h-3.5 text-zinc-300" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "الكاتب" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3.5 py-2 rounded-xl bg-white/[0.07] border border-white/[0.08] text-xs sm:text-sm font-semibold text-zinc-200 max-w-[180px] truncate", children: series.author || "غير محدد" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Palette, { className: "w-3.5 h-3.5 text-zinc-300" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "المترجم" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3.5 py-2 rounded-xl bg-white/[0.07] border border-white/[0.08] text-xs sm:text-sm font-semibold text-zinc-200 max-w-[180px] truncate", children: series.artist || "غير محدد" })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Layers, { className: "w-3.5 h-3.5 text-zinc-300" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "النوع" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3.5 py-2 rounded-xl bg-white/[0.07] border border-white/[0.08] text-xs sm:text-sm font-semibold text-zinc-200", children: series.type === "Novel" ? "رواية" : series.type })
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Ellipsis, { className: "w-3.5 h-3.5 text-zinc-300" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "الحالة" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "div",
                    {
                      className: `px-3.5 py-2 rounded-xl bg-white/[0.07] border border-white/[0.08] text-xs sm:text-sm font-semibold ${series.status === "Ongoing" ? "text-emerald-400" : "text-zinc-200"}`,
                      children: statusLabel
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-3.5 h-3.5 text-emerald-400 fill-emerald-400" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "التقييم" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => setIsRatingModalOpen(true),
                      title: "اضغط لتقييم العمل",
                      className: "px-3.5 py-2 rounded-xl bg-white/[0.07] hover:bg-emerald-500/15 border border-white/[0.08] hover:border-emerald-500/40 text-xs sm:text-sm font-semibold text-zinc-200 tabular-nums transition-colors cursor-pointer",
                      children: [
                        series.rating.toFixed(1),
                        " (",
                        series.ratingCount,
                        ")"
                      ]
                    }
                  )
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1.5 text-xs sm:text-sm font-bold text-white", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3.5 h-3.5 text-zinc-300" }),
                    /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "المشاهدات" })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "px-3.5 py-2 rounded-xl bg-white/[0.07] border border-white/[0.08] text-xs sm:text-sm font-semibold text-zinc-200 tabular-nums", children: series.views.toLocaleString() })
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "pt-2 space-y-3 text-right", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-black text-white tracking-tight", children: "القصة" }),
                descriptionText ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(
                    "p",
                    {
                      className: `text-sm sm:text-[15px] leading-[1.85] text-zinc-300 whitespace-pre-line ${isLongSynopsis && !isSynopsisExpanded ? "line-clamp-4 pb-6" : ""}`,
                      dir: "auto",
                      children: descriptionText
                    }
                  ),
                  isLongSynopsis && !isSynopsisExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-zinc-950 via-zinc-950/90 to-transparent flex items-end justify-center pt-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => setIsSynopsisExpanded(true),
                      className: "px-4 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-xs font-bold text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer backdrop-blur-sm",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowDown, { className: "w-3.5 h-3.5" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "توسيع" })
                      ]
                    }
                  ) }),
                  isLongSynopsis && isSynopsisExpanded && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "mt-3 flex justify-center", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
                    "button",
                    {
                      type: "button",
                      onClick: () => setIsSynopsisExpanded(false),
                      className: "px-4 py-1.5 rounded-full bg-white/[0.08] hover:bg-white/[0.14] border border-white/10 text-xs font-bold text-white inline-flex items-center gap-1.5 transition-colors cursor-pointer",
                      children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUp, { className: "w-3.5 h-3.5" }),
                        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "تقليص" })
                      ]
                    }
                  ) })
                ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-zinc-500", children: "لا يوجد وصف متاح لهذا العمل حالياً." })
              ] }),
              series.tags && series.tags.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-1 flex items-center flex-wrap gap-1.5", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Tag, { className: "w-3.5 h-3.5 text-zinc-500 ml-1" }),
                series.tags.map((tag) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "span",
                  {
                    className: "px-2.5 py-1 bg-white/[0.04] border border-white/[0.08] text-zinc-300 rounded-lg text-xs font-medium",
                    children: [
                      "#",
                      tag
                    ]
                  },
                  tag
                ))
              ] })
            ]
          }
        )
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "mt-10 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-white/[0.07] gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setActiveTab("chapters"),
                className: `px-5 py-3.5 text-sm font-bold transition-colors relative cursor-pointer whitespace-nowrap ${activeTab === "chapters" ? "text-white" : "text-zinc-500 hover:text-zinc-200"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "الفصول" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mr-1.5 text-xs text-zinc-400 tabular-nums", children: [
                    "(",
                    chapters.length,
                    ")"
                  ] }),
                  activeTab === "chapters" && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { layoutId: "activeTab", className: "absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" })
                ]
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setActiveTab("comments"),
                className: `px-5 py-3.5 text-sm font-bold transition-colors relative cursor-pointer whitespace-nowrap ${activeTab === "comments" ? "text-white" : "text-zinc-500 hover:text-zinc-200"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "التعليقات" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "mr-1.5 text-xs text-zinc-400 tabular-nums", children: [
                    "(",
                    commentsCount,
                    ")"
                  ] }),
                  activeTab === "comments" && /* @__PURE__ */ jsxRuntimeExports.jsx(motion.div, { layoutId: "activeTab", className: "absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" })
                ]
              }
            )
          ] }),
          activeTab === "chapters" && readCountInSeries > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs text-zinc-400 tabular-nums hidden sm:inline", children: [
            "قرأت ",
            readCountInSeries,
            " من ",
            chapters.length
          ] })
        ] }),
        activeTab === "chapters" ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
          chapters.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-stretch sm:items-center gap-3", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative flex-1", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-4 h-4 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "input",
                {
                  type: "text",
                  value: chapterSearch,
                  onChange: (e) => setChapterSearch(e.target.value),
                  placeholder: "ابحث برقم الفصل أو العنوان...",
                  className: "w-full min-h-[42px] bg-zinc-900/60 border border-white/[0.08] focus:border-emerald-500/50 rounded-xl pr-10 pl-4 py-2 text-sm text-white placeholder-zinc-500 outline-none transition-colors text-right"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "button",
              {
                type: "button",
                onClick: () => setChapterSort((prev) => prev === "desc" ? "asc" : "desc"),
                className: "min-h-[42px] px-4 py-2 bg-zinc-900/60 hover:bg-zinc-800/80 border border-white/[0.08] rounded-xl text-xs font-bold text-zinc-200 flex items-center justify-center gap-2 transition-colors cursor-pointer whitespace-nowrap shrink-0",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowUpDown, { className: "w-3.5 h-3.5 text-emerald-400" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: chapterSort === "desc" ? "الأحدث أولاً" : "الأقدم أولاً" })
                ]
              }
            )
          ] }),
          filteredAndSortedChapters.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-zinc-900/35 border border-white/[0.07] rounded-2xl divide-y divide-white/[0.06] overflow-hidden", children: filteredAndSortedChapters.map((chapter) => {
            var _a2, _b;
            const isRead = readChapterIds.has(chapter.id);
            const isLastRead = lastReadChapterId === chapter.id;
            return /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                role: "button",
                tabIndex: 0,
                onClick: () => navigate(`/series/${series.slug}/${chapter.chapterNumber}`),
                onKeyDown: (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(`/series/${series.slug}/${chapter.chapterNumber}`);
                  }
                },
                className: `group px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between gap-4 transition-colors cursor-pointer ${isLastRead ? "bg-amber-500/[0.07] hover:bg-amber-500/[0.11]" : isRead ? "bg-emerald-500/[0.02] hover:bg-white/[0.04]" : "hover:bg-white/[0.04]"}`,
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3.5 sm:gap-4 min-w-0", children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      "div",
                      {
                        className: `w-10 h-10 rounded-xl flex items-center justify-center text-xs sm:text-sm font-bold tabular-nums shrink-0 transition-colors ${isLastRead ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : isRead ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25" : "bg-zinc-950/80 text-zinc-400 border border-white/[0.06] group-hover:text-emerald-400"}`,
                        children: chapter.chapterNumber
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0 text-right", dir: "auto", children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                        /* @__PURE__ */ jsxRuntimeExports.jsx(
                          "h3",
                          {
                            className: `text-sm sm:text-[15px] font-semibold truncate transition-colors ${isLastRead ? "text-amber-200 group-hover:text-amber-300" : isRead ? "text-zinc-300 group-hover:text-emerald-400" : "text-zinc-100 group-hover:text-emerald-400"}`,
                            children: chapter.title || `الفصل ${chapter.chapterNumber}`
                          }
                        ),
                        isLastRead ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] font-semibold text-amber-400", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Bookmark, { className: "w-3 h-3 fill-amber-400" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "توقفت هنا" })
                        ] }) : isRead ? /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400", children: [
                          /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3 h-3" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "مقروء" })
                        ] }) : null
                      ] }),
                      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-500 mt-0.5", children: formatRelativeArabicDate(chapter.publishDate) })
                    ] })
                  ] }),
                  /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 shrink-0", children: [
                    chapter.isPremium && /* @__PURE__ */ jsxRuntimeExports.jsxs(
                      "span",
                      {
                        className: `inline-flex items-center gap-1 text-xs font-bold tabular-nums ${((_a2 = profile == null ? void 0 : profile.unlockedChapters) == null ? void 0 : _a2.includes(chapter.id)) ? "text-emerald-400" : "text-amber-400"}`,
                        children: [
                          ((_b = profile == null ? void 0 : profile.unlockedChapters) == null ? void 0 : _b.includes(chapter.id)) ? /* @__PURE__ */ jsxRuntimeExports.jsx(LockOpen, { className: "w-3.5 h-3.5" }) : /* @__PURE__ */ jsxRuntimeExports.jsx(Lock, { className: "w-3.5 h-3.5" }),
                          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: chapter.coinPrice })
                        ]
                      }
                    ),
                    /* @__PURE__ */ jsxRuntimeExports.jsx(
                      ChevronRight,
                      {
                        className: `w-4 h-4 transform rotate-180 group-hover:-translate-x-0.5 transition-all ${isLastRead ? "text-amber-400" : isRead ? "text-emerald-400" : "text-zinc-600 group-hover:text-emerald-400"}`
                      }
                    )
                  ] })
                ]
              },
              chapter.id
            );
          }) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-zinc-900/35 border border-white/[0.07] rounded-2xl py-12 px-6 text-center text-sm text-zinc-500", children: chapterSearch.trim() ? "لا توجد فصول مطابقة لبحثك" : "لم يتم نشر فصول لهذا العمل بعد" })
        ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx(CommentsSection, { seriesId: series.id, isAdmin: (profile == null ? void 0 : profile.role) === "admin" })
      ] })
    ] }),
    similarWorks.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("section", { className: "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 pt-10 border-t border-white/[0.06] space-y-6 text-right", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center justify-between gap-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl sm:text-2xl font-bold tracking-tight text-white", children: "أعمال مشابهة قد تعجبك" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-500 mt-1", children: "مقترحات بناءً على التصنيف، الكاتب، والقصة" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 gap-3.5 sm:gap-4 snap-x snap-mandatory hide-scrollbar", children: similarWorks.map((work) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "div",
        {
          className: "w-[115px] sm:w-[135px] md:w-[145px] lg:w-[155px] transition-transform duration-200 hover:-translate-y-1 snap-start shrink-0",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(SeriesCard, { series: work, size: "small" })
        },
        work.id
      )) })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: isRatingModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
      motion.div,
      {
        initial: { opacity: 0, scale: 0.95, y: 12 },
        animate: { opacity: 1, scale: 1, y: 0 },
        exit: { opacity: 0, scale: 0.95, y: 12 },
        className: "bg-zinc-950 w-full max-w-md rounded-2xl border border-white/10 shadow-2xl p-6 sm:p-8 space-y-6 text-center",
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-7 h-7 fill-emerald-400 text-emerald-400" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-bold text-white", children: "تقييم العمل" }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-zinc-400 text-sm", children: [
              'ما هو تقييمك لـ "',
              series.title,
              '"؟'
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center items-center gap-2.5 py-2", dir: "ltr", children: [1, 2, 3, 4, 5].map((starsVal) => {
            const isHoveredOrSelected = (hoveredStars !== null ? hoveredStars : selectedStars) >= starsVal;
            return /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onMouseEnter: () => setHoveredStars(starsVal),
                onMouseLeave: () => setHoveredStars(null),
                onClick: () => setSelectedStars(starsVal),
                className: "p-1.5 transition-transform active:scale-95 hover:scale-110 cursor-pointer",
                children: /* @__PURE__ */ jsxRuntimeExports.jsx(
                  Star,
                  {
                    className: `w-9 h-9 transition-colors duration-150 ${isHoveredOrSelected ? "text-emerald-400 fill-emerald-400" : "text-zinc-700 fill-transparent"}`
                  }
                )
              },
              starsVal
            );
          }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-semibold text-zinc-400 tabular-nums", children: [
            selectedStars,
            " من أصل 5 نجوم"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 pt-1", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: handleRatingSubmit,
                className: "flex-1 min-h-[44px] py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-colors cursor-pointer",
                children: "إرسال التقييم"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                type: "button",
                onClick: () => setIsRatingModalOpen(false),
                className: "flex-1 min-h-[44px] py-2.5 bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold rounded-xl transition-colors border border-white/10 cursor-pointer",
                children: "إلغاء"
              }
            )
          ] })
        ]
      }
    ) }) }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { children: toastMessage && /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        initial: { opacity: 0, y: 24, x: "-50%" },
        animate: { opacity: 1, y: 0, x: "-50%" },
        exit: { opacity: 0, y: 24, x: "-50%" },
        className: "fixed bottom-6 left-1/2 z-[100] px-5 py-2.5 bg-zinc-900 border border-white/10 text-white rounded-full shadow-2xl font-semibold text-sm whitespace-nowrap",
        children: toastMessage
      }
    ) })
  ] });
};
export {
  SeriesDetail
};
