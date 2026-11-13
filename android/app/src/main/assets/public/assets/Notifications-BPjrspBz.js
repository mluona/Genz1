import { c as createLucideIcon, C as useAuth, B as useNavigate, r as reactExports, y as supabase, w as jsxRuntimeExports, E as Bell, L as Link } from "./index-BNptM8td.js";
import { f as formatRelativeArabicDate } from "./dateUtils-BpVYGPxh.js";
import { g as getProxiedImageUrl } from "./imageUtils-CO4tJ9Ml.js";
import { B as BellRing } from "./bell-ring-DFTUPiuS.js";
import { C as Check } from "./check-CALsGMvw.js";
import { T as Trash2 } from "./trash-2-C0MAntLE.js";
import { B as BookOpen } from "./book-open-B8xp784j.js";
import { C as Clock } from "./clock-BUWQYWD4.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["path", { d: "M5 12h14", key: "1ays0h" }],
  ["path", { d: "m12 5 7 7-7 7", key: "xquz4c" }]
];
const ArrowRight = createLucideIcon("arrow-right", __iconNode);
const Notifications = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  reactExports.useEffect(() => {
    fetchSubscribedNotifications();
  }, [user, profile]);
  const fetchSubscribedNotifications = async () => {
    setLoading(true);
    try {
      let subscribedIds = [];
      if (profile) {
        const profileSubs = (profile == null ? void 0 : profile.subscribedSeries) || [];
        const profileFavs = profile.favorites || [];
        subscribedIds = Array.from(/* @__PURE__ */ new Set([...profileSubs, ...profileFavs]));
      }
      if (user) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`sub_${user.id}_`) && localStorage.getItem(key) === "true") {
            const sid = key.replace(`sub_${user.id}_`, "");
            if (!subscribedIds.includes(sid)) {
              subscribedIds.push(sid);
            }
          }
        }
      }
      if (subscribedIds.length === 0) {
        const { data: recentSeries } = await supabase.from("series").select("id").limit(5);
        if (recentSeries) {
          subscribedIds = recentSeries.map((s) => s.id);
        }
      }
      if (subscribedIds.length === 0) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      const { data: seriesList } = await supabase.from("series").select("id, title, coverImage, slug").in("id", subscribedIds);
      if (!seriesList || seriesList.length === 0) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      const seriesMap = new Map(
        seriesList.map((s) => [s.id, s])
      );
      const { data: chaptersList } = await supabase.from("chapters").select("id, seriesId, chapterNumber, title, publishDate").in("seriesId", subscribedIds).order("publishDate", { ascending: false }).limit(30);
      if (!chaptersList) {
        setNotifications([]);
        setLoading(false);
        return;
      }
      const readIds = new Set(JSON.parse(localStorage.getItem(`read_notifications_${(user == null ? void 0 : user.id) || "guest"}`) || "[]"));
      const items = chaptersList.map((ch) => {
        const s = seriesMap.get(ch.seriesId);
        return {
          id: ch.id,
          seriesId: ch.seriesId,
          seriesTitle: (s == null ? void 0 : s.title) || "عمل جديد",
          seriesCover: (s == null ? void 0 : s.coverImage) || "",
          seriesSlug: (s == null ? void 0 : s.slug) || "",
          chapterNumber: ch.chapterNumber,
          chapterTitle: ch.title,
          publishDate: ch.publishDate,
          read: readIds.has(ch.id)
        };
      });
      setNotifications(items);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };
  const markAllAsRead = () => {
    const allIds = notifications.map((n) => n.id);
    localStorage.setItem(`read_notifications_${(user == null ? void 0 : user.id) || "guest"}`, JSON.stringify(allIds));
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };
  const markAsRead = (id, e) => {
    const readIds = JSON.parse(localStorage.getItem(`read_notifications_${(user == null ? void 0 : user.id) || "guest"}`) || "[]");
    if (!readIds.includes(id)) {
      readIds.push(id);
      localStorage.setItem(`read_notifications_${(user == null ? void 0 : user.id) || "guest"}`, JSON.stringify(readIds));
    }
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };
  const clearAllNotifications = () => {
    setNotifications([]);
  };
  const unreadCount = notifications.filter((n) => !n.read).length;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-h-screen bg-zinc-950 text-white pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between border-b border-white/5 pb-6 mb-8 flex-wrap gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => navigate(-1),
            className: "p-2.5 bg-zinc-900 hover:bg-zinc-800 rounded-2xl border border-white/5 text-zinc-400 hover:text-white transition-all",
            title: "رجوع",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(ArrowRight, { className: "w-5 h-5" })
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BellRing, { className: "w-6 h-6 animate-pulse" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("h1", { className: "text-2xl font-black tracking-tight flex items-center gap-2", children: [
            "مركز الإشعارات",
            unreadCount > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "px-2.5 py-0.5 bg-emerald-500 text-black text-xs font-black rounded-full", children: [
              unreadCount,
              " جديد"
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-400 mt-1", children: "تنبيهات الفصول الجديدة للأعمال المفضلة والمشترك بها" })
        ] })
      ] }),
      notifications.length > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: markAllAsRead,
            className: "px-4 py-2 bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 rounded-xl border border-white/5 transition-all flex items-center gap-1.5",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Check, { className: "w-3.5 h-3.5 text-emerald-400" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "تحديد الكل كُمقروء" })
            ]
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: clearAllNotifications,
            className: "p-2 bg-white/5 hover:bg-red-500/10 text-zinc-400 hover:text-red-400 rounded-xl border border-white/5 transition-all",
            title: "مسح القائمة",
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
          }
        )
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center justify-center py-20 gap-4 text-zinc-500", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold", children: "جاري تحميل الإشعارات..." })
    ] }) : notifications.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel p-12 rounded-[2rem] text-center space-y-4 border border-white/5 max-w-md mx-auto my-12", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto text-zinc-500 border border-white/5", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Bell, { className: "w-8 h-8 opacity-40" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-lg font-black text-white", children: "لا توجد إشعارات حالياً" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-400 leading-relaxed", children: "قم بتفعيل زر التنبيه 🔔 في صفحة أي عمل ليصلك إشعار فوري عند صدور أي فصل جديد." }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        Link,
        {
          to: "/library",
          className: "inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all mt-2",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-4 h-4" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "تصفح المكتبة" })
          ]
        }
      )
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-3", children: notifications.map((item) => /* @__PURE__ */ jsxRuntimeExports.jsxs(
      "div",
      {
        onClick: () => {
          markAsRead(item.id);
          navigate(`/series/${item.seriesSlug}/${item.chapterNumber}`);
        },
        className: `p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between gap-4 cursor-pointer group ${item.read ? "bg-zinc-900/30 border-white/5 opacity-75 hover:opacity-100 hover:bg-zinc-900/60" : "bg-emerald-500/[0.04] border-emerald-500/30 hover:bg-emerald-500/[0.08] shadow-lg shadow-emerald-500/5"}`,
        children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: getProxiedImageUrl(item.seriesCover),
                  alt: item.seriesTitle,
                  className: "w-12 h-16 object-cover rounded-xl border border-white/10 shadow-md group-hover:scale-105 transition-transform"
                }
              ),
              !item.read && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse" })
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1 text-right min-w-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-xs font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20", children: [
                  "فصل جديد #",
                  item.chapterNumber
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "text-[10px] text-zinc-500 flex items-center gap-1", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-3 h-3" }),
                  formatRelativeArabicDate(item.publishDate)
                ] })
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-white truncate group-hover:text-emerald-300 transition-colors", children: item.seriesTitle }),
              item.chapterTitle && /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-400 truncate", children: item.chapterTitle })
            ] })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 shrink-0", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "hidden sm:inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500 text-black text-xs font-black rounded-xl group-hover:scale-105 transition-transform", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-3.5 h-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: "قراءة" })
          ] }) })
        ]
      },
      item.id
    )) })
  ] });
};
export {
  Notifications
};
