import { c as createLucideIcon, r as reactExports, y as supabase, w as jsxRuntimeExports, X } from "./index-BNptM8td.js";
import { P as Plus } from "./plus-BsfOAGru.js";
import { C as Coins } from "./coins-Dzew_KuE.js";
import { P as Pen } from "./pen-mIybmmv0.js";
import { T as Trash2 } from "./trash-2-C0MAntLE.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",
      key: "1c8476"
    }
  ],
  ["path", { d: "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7", key: "1ydtos" }],
  ["path", { d: "M7 3v4a1 1 0 0 0 1 1h7", key: "t51u73" }]
];
const Save = createLucideIcon("save", __iconNode);
const CoinPackagesManagement = () => {
  const [packages, setPackages] = reactExports.useState([]);
  const [loading, setLoading] = reactExports.useState(true);
  const [isEditing, setIsEditing] = reactExports.useState(false);
  const [editingId, setEditingId] = reactExports.useState(null);
  const [formData, setFormData] = reactExports.useState({
    name: "",
    coins: 100,
    price: 1,
    currency: "USD",
    bonusCoins: 0,
    isActive: true
  });
  const fetchPackages = async () => {
    const { data, error } = await supabase.from("coin_packages").select("*").order("price", { ascending: true });
    if (error) {
      console.error("Error fetching coin packages:", error);
      return;
    }
    setPackages(data || []);
    setLoading(false);
  };
  reactExports.useEffect(() => {
    fetchPackages();
    const channel = supabase.channel("coin_packages_changes").on("postgres_changes", { event: "*", schema: "public", table: "coin_packages" }, () => {
      fetchPackages();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const { error } = await supabase.from("coin_packages").update(formData).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("coin_packages").insert({
          ...formData,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        });
        if (error) throw error;
      }
      setIsEditing(false);
      setEditingId(null);
      setFormData({ name: "", coins: 100, price: 1, currency: "USD", bonusCoins: 0, isActive: true });
    } catch (error) {
      console.error("Error saving coin package:", error);
      alert(error.message || "Failed to save package");
    }
  };
  const handleEdit = (pkg) => {
    setFormData({
      name: pkg.name,
      coins: pkg.coins,
      price: pkg.price,
      currency: pkg.currency || "USD",
      bonusCoins: pkg.bonusCoins || 0,
      isActive: pkg.isActive
    });
    setEditingId(pkg.id);
    setIsEditing(true);
  };
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this package?")) {
      try {
        const { error } = await supabase.from("coin_packages").delete().eq("id", id);
        if (error) throw error;
      } catch (error) {
        console.error("Error deleting coin package:", error);
        alert(error.message || "Failed to delete package");
      }
    }
  };
  if (loading) {
    return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "p-8", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" }) });
  }
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between mb-8", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-black tracking-tight mb-2", children: "Coin Packages" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500", children: "Manage currency purchase options for users." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: () => {
            setEditingId(null);
            setFormData({ name: "", coins: 100, price: 1, currency: "USD", bonusCoins: 0, isActive: true });
            setIsEditing(true);
          },
          className: "flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Plus, { className: "w-5 h-5" }),
            "Add Package"
          ]
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6", children: packages.map((pkg) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: `bg-white rounded-2xl p-6 border ${pkg.isActive ? "border-zinc-200" : "border-red-200 opacity-75"}`, children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "w-6 h-6" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "font-bold text-lg", children: pkg.name }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 text-sm", children: pkg.isActive ? "Active" : "Inactive" })
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleEdit(pkg), className: "p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pen, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDelete(pkg.id), className: "p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-2 mb-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-500", children: "Base Coins" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold", children: pkg.coins })
        ] }),
        pkg.bonusCoins > 0 && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-500", children: "Bonus Coins" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold text-emerald-500", children: [
            "+",
            pkg.bonusCoins
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex justify-between text-sm pt-2 border-t border-zinc-100", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-zinc-500", children: "Price" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "font-bold", children: [
            pkg.price,
            " ",
            pkg.currency
          ] })
        ] })
      ] })
    ] }, pkg.id)) }),
    isEditing && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-6 border-b border-zinc-100 flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl font-bold", children: editingId ? "Edit Package" : "Add Package" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setIsEditing(false), className: "p-2 hover:bg-zinc-100 rounded-full transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-5 h-5" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("form", { onSubmit: handleSave, className: "p-6 space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-bold text-zinc-700 mb-1", children: "Package Name" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              required: true,
              value: formData.name,
              onChange: (e) => setFormData({ ...formData, name: e.target.value }),
              className: "w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500",
              placeholder: "e.g. Starter Pack"
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-bold text-zinc-700 mb-1", children: "Base Coins" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                required: true,
                min: "1",
                value: formData.coins,
                onChange: (e) => setFormData({ ...formData, coins: Number(e.target.value) }),
                className: "w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-bold text-zinc-700 mb-1", children: "Bonus Coins" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                min: "0",
                value: formData.bonusCoins,
                onChange: (e) => setFormData({ ...formData, bonusCoins: Number(e.target.value) }),
                className: "w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-bold text-zinc-700 mb-1", children: "Price" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                required: true,
                min: "0.01",
                step: "0.01",
                value: formData.price,
                onChange: (e) => setFormData({ ...formData, price: Number(e.target.value) }),
                className: "w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              }
            )
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-sm font-bold text-zinc-700 mb-1", children: "Currency" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "text",
                required: true,
                value: formData.currency,
                onChange: (e) => setFormData({ ...formData, currency: e.target.value.toUpperCase() }),
                className: "w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500",
                placeholder: "USD"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-3 pt-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "checkbox",
              id: "isActive",
              checked: formData.isActive,
              onChange: (e) => setFormData({ ...formData, isActive: e.target.checked }),
              className: "w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { htmlFor: "isActive", className: "font-bold text-zinc-700", children: "Package is Active" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 flex gap-3", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              type: "button",
              onClick: () => setIsEditing(false),
              className: "flex-1 px-4 py-3 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition-colors",
              children: "Cancel"
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              type: "submit",
              className: "flex-1 px-4 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Save, { className: "w-5 h-5" }),
                "Save Package"
              ]
            }
          )
        ] })
      ] })
    ] }) })
  ] });
};
export {
  CoinPackagesManagement
};
