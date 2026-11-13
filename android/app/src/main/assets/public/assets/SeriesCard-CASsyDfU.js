import { w as jsxRuntimeExports, L as Link } from "./index-BNptM8td.js";
import { g as getProxiedImageUrl } from "./imageUtils-CO4tJ9Ml.js";
import { E as Eye } from "./eye-Dt8TQbSX.js";
import { S as Star } from "./star-Dlimeg9j.js";
import { C as Clock } from "./clock-BUWQYWD4.js";
import { f as formatDistanceToNow } from "./formatDistanceToNow-K3QoIsIe.js";
const SeriesCard = ({ series, compact = false, size = "default" }) => {
  const isNew = (() => {
    const dateToUse = series.createdAt;
    if (!dateToUse) return false;
    try {
      const createdDate = new Date(dateToUse);
      const timeDiff = (/* @__PURE__ */ new Date()).getTime() - createdDate.getTime();
      const daysDiff = timeDiff / (1e3 * 3600 * 24);
      return daysDiff <= 3;
    } catch (e) {
      return false;
    }
  })();
  if (compact) {
    return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: `/series/${series.slug}`, className: "group flex gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors flex-row-reverse text-right", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-16 h-20 flex-shrink-0 relative overflow-hidden rounded-lg", children: /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: getProxiedImageUrl(series.coverImage),
          alt: series.title,
          className: "w-full h-full object-cover group-hover:scale-110 transition-transform duration-500",
          referrerPolicy: "no-referrer"
        }
      ) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col justify-center min-w-0 flex-1", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h4", { className: "text-sm font-bold text-white truncate text-right", children: series.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 mt-1 text-[10px] font-medium text-zinc-500 uppercase tracking-wider flex-row-reverse justify-end", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 flex-row-reverse", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3 h-3" }),
            " ",
            series.views.toLocaleString()
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-emerald-500 flex-row-reverse", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-3 h-3 fill-current" }),
            " ",
            series.rating.toFixed(1)
          ] })
        ] })
      ] })
    ] });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs(Link, { to: `/series/${series.slug}`, className: `group relative flex flex-col ${size === "small" ? "gap-1.5" : "gap-3"}`, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `aspect-[3/4] relative overflow-hidden bg-zinc-900 border border-white/5 ${size === "small" ? "rounded-xl" : "rounded-2xl"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "img",
        {
          src: getProxiedImageUrl(series.coverImage),
          alt: series.title,
          className: "w-full h-full object-cover group-hover:scale-105 transition-transform duration-700",
          referrerPolicy: "no-referrer"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" }),
      isNew && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `absolute flex flex-col gap-2 items-end ${size === "small" ? "top-2 right-2" : "top-3 right-3"}`, children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `bg-white font-black text-black rounded uppercase tracking-tighter ${size === "small" ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-1 text-[10px]"}`, children: "جديد" }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `absolute flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-row-reverse ${size === "small" ? "bottom-2 left-2 right-2" : "bottom-3 left-3 right-3"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1 font-bold flex-row-reverse ${size === "small" ? "text-[10px]" : "text-xs"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Star, { className: "w-3 h-3 fill-emerald-500 text-emerald-500" }),
          series.rating.toFixed(1)
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1 font-bold flex-row-reverse ${size === "small" ? "text-[10px]" : "text-xs"}`, children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Eye, { className: "w-3 h-3" }),
          series.views > 1e3 ? `${(series.views / 1e3).toFixed(1)}k` : series.views
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col gap-0.5 text-right", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: `${size === "small" ? "text-xs leading-snug line-clamp-2" : "text-sm leading-tight line-clamp-2"} font-bold text-white group-hover:text-emerald-400 transition-colors`, children: series.title }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `flex items-center gap-1.5 font-medium text-zinc-500 uppercase tracking-widest flex-row-reverse justify-end ${size === "small" ? "text-[9px]" : "text-[10px]"}`, children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(Clock, { className: "w-2.5 h-2.5" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: (() => {
          if (!series.lastUpdated) return "غير معروف";
          try {
            const dateObj = new Date(series.lastUpdated);
            if (isNaN(dateObj.getTime())) return "غير معروف";
            const result = formatDistanceToNow(dateObj, { addSuffix: true });
            return result.replace("about ", "تقريباً ").replace("over ", "أكثر من ").replace("almost ", "تقريباً ").replace("less than ", "أقل من ").replace("a few seconds ago", "منذ بضع ثوانٍ").replace("half a minute ago", "منذ نصف دقيقة").replace("less than a minute ago", "منذ أقل من دقيقة").replace(" minutes ago", " دقائق مضت").replace(" minute ago", " دقيقة مضت").replace(" hours ago", " ساعات مضت").replace(" hour ago", " ساعة مضت").replace(" days ago", " أيام مضت").replace(" day ago", " يوم مضت").replace(" months ago", " أشهر مضت").replace(" month ago", " شهر مضت").replace(" years ago", " سنوات مضت").replace(" year ago", " سنة مضت").replace("a minute ago", "منذ دقيقة").replace("an hour ago", "منذ ساعة").replace("a day ago", "منذ يوم").replace("a month ago", "منذ شهر").replace("a year ago", "منذ سنة").replace("ago", "مضت");
          } catch (e) {
            return "غير معروف";
          }
        })() })
      ] })
    ] })
  ] });
};
export {
  SeriesCard as S
};
