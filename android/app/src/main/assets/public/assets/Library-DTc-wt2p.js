import { r as reactExports, Q as useSearchParams, y as supabase, w as jsxRuntimeExports, G as Search, x as motion, A as AnimatePresence } from "./index-BNptM8td.js";
import { S as SeriesCard } from "./SeriesCard-CASsyDfU.js";
import { L as LayoutGrid } from "./layout-grid-Da11fv6Z.js";
import { L as List } from "./list-CfKH3iED.js";
import "./imageUtils-CO4tJ9Ml.js";
import "./eye-Dt8TQbSX.js";
import "./star-Dlimeg9j.js";
import "./clock-BUWQYWD4.js";
import "./formatDistanceToNow-K3QoIsIe.js";
const GENRES = [
  "أكشن",
  "مغامرة",
  "كوميدي",
  "دراما",
  "خيالي",
  "رعب",
  "غموض",
  "نفسي",
  "رومانسي",
  "خيال علمي",
  "شريحة من الحياة",
  "رياضي",
  "قوى خارقة",
  "إثارة",
  "صينية",
  "كورية",
  "يابانية",
  "سحر",
  "إعادة زمن",
  "ايسكاي",
  "فنون قتالية",
  "إعادة تجسيد",
  "زراعة قوى",
  "ألعاب فيديو",
  "تطوير المستوى",
  "نظام",
  "أكاديمية",
  "برج",
  "دهاليز"
];
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
const Library = () => {
  const [seriesList, setSeriesList] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [selectedGenre, setSelectedGenre] = reactExports.useState("All");
  const [viewMode, setViewMode] = reactExports.useState("grid");
  const [searchParams] = useSearchParams();
  reactExports.useEffect(() => {
    const genreParam = searchParams.get("genre");
    if (genreParam) {
      const arabicGenre = GENRE_TRANSLATIONS[genreParam] || genreParam;
      setSelectedGenre(arabicGenre);
    }
  }, [searchParams]);
  reactExports.useEffect(() => {
    const fetchSeries = async () => {
      const { data, error } = await supabase.from("series").select("*").order("title", { ascending: true });
      if (error) {
        console.error("Error fetching series:", error);
        return;
      }
      setSeriesList(data || []);
      setLoading(false);
    };
    fetchSeries();
    const channel = supabase.channel("library_changes").on("postgres_changes", { event: "*", schema: "public", table: "series" }, () => {
      fetchSeries();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const filteredSeries = seriesList.filter((series) => {
    var _a;
    const matchesSearch = series.title.toLowerCase().includes(searchTerm.toLowerCase()) || ((_a = series.author) == null ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesGenre = selectedGenre === "All" || (series.genres || []).some((g) => {
      const gArabic = GENRE_TRANSLATIONS[g] || g;
      return gArabic === selectedGenre || g === selectedGenre;
    });
    return matchesSearch && matchesGenre;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-zinc-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto space-y-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-end justify-between gap-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl sm:text-6xl font-black tracking-tighter uppercase italic text-gradient", children: "المكتبة" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 font-medium mt-2 uppercase tracking-widest text-xs", children: "استكشف مجموعتنا الكاملة من الأعمال الرائعة" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative group", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "البحث في المكتبة...",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              className: "w-full sm:w-72 bg-zinc-900/50 border border-white/5 rounded-2xl py-3 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-zinc-900 transition-all text-right"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setViewMode("grid"),
              className: `p-2 rounded-xl transition-all ${viewMode === "grid" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-white"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(LayoutGrid, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => setViewMode("list"),
              className: `p-2 rounded-xl transition-all ${viewMode === "list" ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" : "text-zinc-500 hover:text-white"}`,
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(List, { className: "w-4 h-4" })
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex flex-col gap-6", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSelectedGenre("All"),
          className: `px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedGenre === "All" ? "bg-white text-black" : "bg-zinc-900/50 text-zinc-500 hover:text-white border border-white/5"}`,
          children: "كل التصنيفات"
        }
      ),
      GENRES.map((genre) => /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setSelectedGenre(genre),
          className: `px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedGenre === genre ? "bg-white text-black" : "bg-zinc-900/50 text-zinc-500 hover:text-white border border-white/5"}`,
          children: GENRE_TRANSLATIONS[genre] || genre
        },
        genre
      ))
    ] }) }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" }) }) : filteredSeries.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx(
      motion.div,
      {
        layout: true,
        className: viewMode === "grid" ? "grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 sm:gap-8" : "space-y-4",
        children: /* @__PURE__ */ jsxRuntimeExports.jsx(AnimatePresence, { mode: "popLayout", children: filteredSeries.map((series) => /* @__PURE__ */ jsxRuntimeExports.jsx(
          motion.div,
          {
            layout: true,
            initial: { opacity: 0, scale: 0.9 },
            animate: { opacity: 1, scale: 1 },
            exit: { opacity: 0, scale: 0.9 },
            transition: { duration: 0.2 },
            children: /* @__PURE__ */ jsxRuntimeExports.jsx(SeriesCard, { series, compact: viewMode === "list" })
          },
          series.id
        )) })
      }
    ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center py-40 space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "w-8 h-8 text-zinc-700" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-black uppercase tracking-tight", children: "لم يتم العثور على نتائج" }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 max-w-xs mx-auto", children: "حاول تعديل الفلاتر أو عبارة البحث للعثور على ما تبحث عنه." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => {
            setSearchTerm("");
            setSelectedGenre("All");
          },
          className: "text-emerald-500 font-black uppercase tracking-widest text-[11px] hover:underline",
          children: "مسح جميع الفلاتر"
        }
      )
    ] })
  ] }) });
};
export {
  Library
};
