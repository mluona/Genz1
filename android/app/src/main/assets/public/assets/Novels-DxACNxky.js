import { r as reactExports, y as supabase, w as jsxRuntimeExports, G as Search } from "./index-BNptM8td.js";
import { S as SeriesCard } from "./SeriesCard-CASsyDfU.js";
import { B as BookOpen } from "./book-open-B8xp784j.js";
import "./imageUtils-CO4tJ9Ml.js";
import "./eye-Dt8TQbSX.js";
import "./star-Dlimeg9j.js";
import "./clock-BUWQYWD4.js";
import "./formatDistanceToNow-K3QoIsIe.js";
const Novels = () => {
  const [novels, setNovels] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  reactExports.useEffect(() => {
    const fetchNovels = async () => {
      const { data, error } = await supabase.from("series").select("*").eq("type", "Novel").order("lastUpdated", { ascending: false });
      if (error) {
        console.error("Error fetching novels:", error);
        return;
      }
      setNovels(data || []);
      setLoading(false);
    };
    fetchNovels();
    const channel = supabase.channel("novels_changes").on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "series",
      filter: "type=eq.Novel"
    }, () => {
      fetchNovels();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const filteredNovels = novels.filter(
    (novel) => {
      var _a;
      return novel.title.toLowerCase().includes(searchTerm.toLowerCase()) || ((_a = novel.author) == null ? void 0 : _a.toLowerCase().includes(searchTerm.toLowerCase()));
    }
  );
  return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "min-h-screen bg-zinc-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "max-w-7xl mx-auto space-y-12", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative h-64 sm:h-80 rounded-[2.5rem] overflow-hidden bg-zinc-900 flex items-center justify-center text-center p-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 opacity-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: "https://picsum.photos/seed/novels/1920/1080",
          className: "w-full h-full object-cover",
          alt: "",
          referrerPolicy: "no-referrer"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative z-10 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20", children: /* @__PURE__ */ jsxRuntimeExports.jsx(BookOpen, { className: "w-8 h-8 text-black" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-4xl sm:text-6xl font-black tracking-tighter uppercase italic text-white", children: "الروايات الخفيفة" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-400 font-medium max-w-lg mx-auto uppercase tracking-widest text-[10px]", children: "انغمس في قصص ملحمية ومغامرات أسطورية شيقة" })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row items-center justify-between gap-6", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative w-full sm:w-96 group", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "input",
          {
            type: "text",
            placeholder: "البحث عن الروايات...",
            value: searchTerm,
            onChange: (e) => setSearchTerm(e.target.value),
            className: "w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pr-12 pl-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-zinc-900 transition-all text-right"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-4 text-zinc-500 text-[10px] font-black uppercase tracking-widest", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { children: [
        "تم العثور على ",
        filteredNovels.length,
        " رواية"
      ] }) })
    ] }),
    loading ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex justify-center py-20", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" }) }) : filteredNovels.length > 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 sm:gap-8", children: filteredNovels.map((novel) => /* @__PURE__ */ jsxRuntimeExports.jsx(SeriesCard, { series: novel }, novel.id)) }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center py-40", children: /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 font-bold uppercase tracking-widest text-xs", children: "لم يتم العثور على أي روايات تطابق بحثك." }) })
  ] }) });
};
export {
  Novels
};
