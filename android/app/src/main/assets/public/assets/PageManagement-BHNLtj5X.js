import { c as createLucideIcon, r as reactExports, y as supabase, w as jsxRuntimeExports, X } from "./index-BNptM8td.js";
import { P as Plus } from "./plus-BsfOAGru.js";
import { F as FileText } from "./file-text-BNPSxtcw.js";
import { P as Pen } from "./pen-mIybmmv0.js";
import { T as Trash2 } from "./trash-2-C0MAntLE.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20", key: "13o1zl" }],
  ["path", { d: "M2 12h20", key: "9i4pu4" }]
];
const Globe = createLucideIcon("globe", __iconNode);
const PageManagement = () => {
  const [pages, setPages] = reactExports.useState([]);
  const [isModalOpen, setIsModalOpen] = reactExports.useState(false);
  const [editingPage, setEditingPage] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState({
    title: "",
    slug: "",
    content: ""
  });
  const fetchPages = async () => {
    const { data, error } = await supabase.from("static_pages").select("*").order("lastUpdated", { ascending: false });
    if (error) {
      console.error("Error fetching pages:", error);
      return;
    }
    setPages(data || []);
  };
  reactExports.useEffect(() => {
    fetchPages();
    const channel = supabase.channel("static_pages_changes").on("postgres_changes", { event: "*", schema: "public", table: "static_pages" }, () => {
      fetchPages();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      lastUpdated: (/* @__PURE__ */ new Date()).toISOString()
    };
    try {
      if (editingPage) {
        const { error } = await supabase.from("static_pages").update(data).eq("id", editingPage.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("static_pages").insert([data]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      setEditingPage(null);
      setFormData({ title: "", slug: "", content: "" });
    } catch (error) {
      console.error("Error saving page:", error);
    }
  };
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this page?")) {
      try {
        const { error } = await supabase.from("static_pages").delete().eq("id", id);
        if (error) throw error;
      } catch (error) {
        console.error("Error deleting page:", error);
      }
    }
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-black tracking-tight", children: "Page Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 font-medium", children: "Create and edit static pages like Privacy Policy, TOS, etc." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => {
            setEditingPage(null);
            setIsModalOpen(true);
          },
          className: "flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-2xl hover:bg-zinc-800 transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5" }),
            " Create New Page"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: pages.map((page) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 group", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-3 bg-zinc-100 rounded-2xl text-zinc-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(FileText, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => {
                setEditingPage(page);
                setFormData({ title: page.title, slug: page.slug, content: page.content });
                setIsModalOpen(true);
              },
              className: "p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleDelete(page.id),
              className: "p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" })
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-black text-lg", children: page.title }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-xs text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Globe, { className: "w-3 h-3" }),
          " /",
          page.slug
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm text-zinc-500 line-clamp-2", children: page.content })
    ] }, page.id)) }),
    isModalOpen && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-2xl font-black uppercase tracking-tight", children: editingPage ? "Edit Page" : "Create Page" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsModalOpen(false), className: "p-2 text-zinc-400 hover:bg-zinc-100 rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-6 h-6" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSubmit, className: "p-8 space-y-6", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-6", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2", children: "Page Title" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                required: true,
                value: formData.title,
                onChange: (e) => setFormData({ ...formData, title: e.target.value }),
                className: "w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2", children: "Slug" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                required: true,
                value: formData.slug,
                onChange: (e) => setFormData({ ...formData, slug: e.target.value }),
                className: "w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2", children: "Content (Markdown supported)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "textarea",
            {
              rows: 12,
              required: true,
              value: formData.content,
              onChange: (e) => setFormData({ ...formData, content: e.target.value }),
              className: "w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none resize-none font-mono text-sm"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-end gap-4 pt-6 border-t border-zinc-100", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "button", onClick: () => setIsModalOpen(false), className: "px-8 py-3 text-zinc-500 font-bold hover:bg-zinc-100 rounded-2xl", children: "Cancel" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { type: "submit", className: "px-12 py-3 bg-black text-white font-bold rounded-2xl hover:bg-zinc-800", children: "Save Page" })
        ] })
      ] })
    ] }) })
  ] });
};
export {
  PageManagement
};
