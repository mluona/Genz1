import { c as createLucideIcon, r as reactExports, y as supabase, w as jsxRuntimeExports, G as Search } from "./index-BNptM8td.js";
import { T as Trash2 } from "./trash-2-C0MAntLE.js";
import { S as Shield } from "./shield-6nBXIjn3.js";
import { C as Coins } from "./coins-Dzew_KuE.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M4.929 4.929 19.07 19.071", key: "196cmz" }],
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }]
];
const Ban = createLucideIcon("ban", __iconNode$3);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["path", { d: "M8 2v4", key: "1cmpym" }],
  ["path", { d: "M16 2v4", key: "4m81vk" }],
  ["rect", { width: "18", height: "18", x: "3", y: "4", rx: "2", key: "1hopcy" }],
  ["path", { d: "M3 10h18", key: "8toen8" }]
];
const Calendar = createLucideIcon("calendar", __iconNode$2);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "m15 9-6 6", key: "1uzhvr" }],
  ["path", { d: "m9 9 6 6", key: "z0biqf" }]
];
const CircleX = createLucideIcon("circle-x", __iconNode$1);
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
      d: "M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z",
      key: "sc7q7i"
    }
  ]
];
const Funnel = createLucideIcon("funnel", __iconNode);
const UserManagement = () => {
  const [users, setUsers] = reactExports.useState([]);
  const [searchTerm, setSearchTerm] = reactExports.useState("");
  const [roleFilter, setRoleFilter] = reactExports.useState("all");
  const [selectedUser, setSelectedUser] = reactExports.useState(null);
  const [userTransactions, setUserTransactions] = reactExports.useState([]);
  const [coinsToAdd, setCoinsToAdd] = reactExports.useState(0);
  const [exactCoins, setExactCoins] = reactExports.useState("");
  reactExports.useEffect(() => {
    if (selectedUser) {
      fetchUserTransactions(selectedUser.id);
      setExactCoins(selectedUser.coins || 0);
    }
  }, [selectedUser]);
  const fetchUserTransactions = async (uid) => {
    const { data, error } = await supabase.from("transactions").select("*").eq("userId", uid).order("createdAt", { ascending: false });
    if (error) {
      console.error("Error fetching user transactions:", error);
      return;
    }
    setUserTransactions(data || []);
  };
  const handleDeleteTransaction = async (txId, amount) => {
    try {
      const { error: txError } = await supabase.from("transactions").delete().eq("id", txId);
      if (txError) throw txError;
      if (selectedUser) {
        const { error: profileError } = await supabase.from("profiles").update({ coins: (selectedUser.coins || 0) - amount }).eq("id", selectedUser.id);
        if (profileError) throw profileError;
        setSelectedUser((prev) => prev ? { ...prev, coins: (prev.coins || 0) - amount } : null);
        fetchUserTransactions(selectedUser.id);
        setExactCoins(selectedUser.coins ? selectedUser.coins - amount : 0);
      }
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };
  const fetchUsers = async () => {
    const { data, error } = await supabase.from("profiles").select("*");
    if (error) {
      console.error("Error fetching users:", error);
      return;
    }
    setUsers(data || []);
  };
  reactExports.useEffect(() => {
    fetchUsers();
    const channel = supabase.channel("users_admin_changes").on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
      fetchUsers();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  const handleRoleChange = async (uid, newRole) => {
    try {
      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", uid);
      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };
  const handleBanUser = async (uid, isBanned) => {
    try {
      const { error } = await supabase.from("profiles").update({ banned: isBanned }).eq("id", uid);
      if (error) throw error;
      fetchUsers();
      if (selectedUser && selectedUser.id === uid) {
        setSelectedUser((prev) => prev ? { ...prev, banned: isBanned } : null);
      }
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };
  const handleUpdateCoins = async (uid, currentCoins = 0) => {
    if (coinsToAdd === 0) return;
    try {
      const newCoins = currentCoins + coinsToAdd;
      const { error } = await supabase.from("profiles").update({ coins: newCoins }).eq("id", uid);
      if (error) throw error;
      await supabase.from("transactions").insert([{
        userId: uid,
        amount: coinsToAdd,
        type: "admin_adjustment",
        description: `تعديل رصيد بواسطة الإدارة: ${coinsToAdd > 0 ? "+" : ""}${coinsToAdd}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }]);
      setCoinsToAdd(0);
      setSelectedUser((prev) => prev ? { ...prev, coins: newCoins } : null);
      setExactCoins(newCoins);
      fetchUsers();
      fetchUserTransactions(uid);
    } catch (error) {
      console.error("Error updating coins:", error);
    }
  };
  const handleSetAbsoluteCoins = async (uid, targetCoins) => {
    if (targetCoins < 0) return;
    try {
      const difference = targetCoins - ((selectedUser == null ? void 0 : selectedUser.coins) || 0);
      const { error } = await supabase.from("profiles").update({ coins: targetCoins }).eq("id", uid);
      if (error) throw error;
      await supabase.from("transactions").insert([{
        userId: uid,
        amount: difference,
        type: "admin_adjustment",
        description: `تعديل رصيد مخصص من الإدارة إلى: ${targetCoins}`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }]);
      setSelectedUser((prev) => prev ? { ...prev, coins: targetCoins } : null);
      setExactCoins(targetCoins);
      fetchUsers();
      fetchUserTransactions(uid);
      alert("تم تخصيص رصيد المستخدم بنجاح!");
    } catch (error) {
      console.error("Error setting absolute coins:", error);
    }
  };
  const handleDeleteAllCoins = async (uid) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف أو تصفير جميع عملات هذا المستخدم؟")) return;
    try {
      const difference = -((selectedUser == null ? void 0 : selectedUser.coins) || 0);
      const { error } = await supabase.from("profiles").update({ coins: 0 }).eq("id", uid);
      if (error) throw error;
      await supabase.from("transactions").insert([{
        userId: uid,
        amount: difference,
        type: "admin_clearance",
        description: "تصفير الرصيد بالكامل بواسطة الإدارة",
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      }]);
      setSelectedUser((prev) => prev ? { ...prev, coins: 0 } : null);
      setExactCoins(0);
      fetchUsers();
      fetchUserTransactions(uid);
      alert("تم حذف وتصفير عملات المستخدم بالكامل!");
    } catch (error) {
      console.error("Error clearing user coins:", error);
    }
  };
  const filteredUsers = users.filter((u) => {
    const name = u.username || u.displayName || u.name || "Unknown";
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || (u.email || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-8", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col md:flex-row md:items-center justify-between gap-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-3xl font-black tracking-tight", children: "User Management" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 font-medium", children: "Manage user accounts, roles, and permissions." })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col sm:flex-row gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Funnel, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "select",
            {
              value: roleFilter,
              onChange: (e) => setRoleFilter(e.target.value),
              className: "w-full sm:w-auto bg-white border border-zinc-200 rounded-2xl py-2.5 pl-10 pr-8 text-sm outline-none appearance-none focus:ring-2 focus:ring-emerald-500/20",
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "all", children: "All Roles" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "user", children: "User" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "translator", children: "Translator" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "proofreader", children: "Proofreader" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "typesetter", children: "Typesetter" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "editor", children: "Editor" }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "admin", children: "Admin" })
              ]
            }
          )
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "relative", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(Search, { className: "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "input",
            {
              type: "text",
              placeholder: "Search users...",
              value: searchTerm,
              onChange: (e) => setSearchTerm(e.target.value),
              className: "w-full sm:w-64 bg-white border border-zinc-200 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
            }
          )
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "overflow-x-auto", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("table", { className: "w-full text-left border-collapse min-w-[800px]", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("thead", { children: /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "bg-zinc-50 border-b border-zinc-200", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500", children: "User" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500", children: "Role" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500", children: "Joined" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500", children: "Coins" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500", children: "Status" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("th", { className: "px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500", children: "Actions" })
      ] }) }),
      /* @__PURE__ */ jsxRuntimeExports.jsx("tbody", { className: "divide-y divide-zinc-100", children: filteredUsers.map((user) => /* @__PURE__ */ jsxRuntimeExports.jsxs("tr", { className: "hover:bg-zinc-50 transition-colors cursor-pointer", onClick: () => setSelectedUser(user), children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`, className: "w-10 h-10 rounded-full shrink-0", alt: "", referrerPolicy: "no-referrer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "font-bold truncate", children: user.username || user.displayName || user.name || "Unknown" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-xs text-zinc-500 font-medium truncate", children: user.email })
          ] })
        ] }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("div", { onClick: (e) => e.stopPropagation(), children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "select",
          {
            value: user.role,
            onChange: (e) => handleRoleChange(user.id, e.target.value),
            className: "bg-zinc-100 border-none rounded-lg px-3 py-1 text-xs font-bold outline-none",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "user", children: "User" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "translator", children: "Translator" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "proofreader", children: "Proofreader" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "typesetter", children: "Typesetter" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "editor", children: "Editor" }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("option", { value: "admin", children: "Admin" })
            ]
          }
        ) }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-xs font-bold text-zinc-400 whitespace-nowrap", children: user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Unknown" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4 text-xs font-bold text-amber-500", children: user.coins || 0 }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${user.banned ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`, children: user.banned ? "Banned" : "Active" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("td", { className: "px-6 py-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", onClick: (e) => e.stopPropagation(), children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx(
            "button",
            {
              onClick: () => handleBanUser(user.id, !user.banned),
              className: `p-2 rounded-lg transition-colors ${user.banned ? "text-emerald-500 hover:bg-emerald-50" : "text-orange-500 hover:bg-orange-50"}`,
              title: user.banned ? "Unban User" : "Ban User",
              children: /* @__PURE__ */ jsxRuntimeExports.jsx(Ban, { className: "w-4 h-4" })
            }
          ),
          /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
        ] }) })
      ] }, user.id)) })
    ] }) }) }),
    selectedUser && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "bg-white w-full max-w-md rounded-3xl sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("h2", { className: "text-xl sm:text-2xl font-black uppercase tracking-tight", children: "User Profile" }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => setSelectedUser(null), className: "p-2 text-zinc-400 hover:bg-zinc-100 rounded-full", children: /* @__PURE__ */ jsxRuntimeExports.jsx(CircleX, { className: "w-6 h-6" }) })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-col items-center text-center space-y-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "img",
          {
            src: selectedUser.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.id}`,
            className: "w-24 h-24 rounded-full border-4 border-zinc-100 shadow-lg",
            alt: "",
            referrerPolicy: "no-referrer"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("h3", { className: "text-xl font-black", children: selectedUser.username || selectedUser.displayName || selectedUser.name || "Unknown" }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-500 font-medium", children: selectedUser.email })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: `px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${selectedUser.role === "admin" ? "bg-purple-100 text-purple-600" : "bg-zinc-100 text-zinc-600"}`, children: selectedUser.role })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "grid grid-cols-2 gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-zinc-50 rounded-2xl space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Calendar, { className: "w-3 h-3" }),
            " Joined"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-sm font-bold", children: selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "Unknown" })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-zinc-50 rounded-2xl space-y-1", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Shield, { className: "w-3 h-3" }),
            " Status"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: `text-sm font-bold ${selectedUser.banned ? "text-red-500" : "text-emerald-500"}`, children: selectedUser.banned ? "Banned" : "Active" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "p-4 bg-zinc-50 rounded-2xl space-y-4 text-right animate-in fade-in duration-200", dir: "rtl", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Coins, { className: "w-3 h-3 text-amber-500" }),
            " رصيد المستخدم الحالي"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("p", { className: "text-sm font-bold text-amber-500 font-mono", children: [
            selectedUser.coins || 0,
            " عملة"
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 pt-2 border-t border-zinc-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[9px] font-black uppercase tracking-widest text-zinc-400", children: "إضافة أو خصم رصيد (قيمة نسبية)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: coinsToAdd === 0 ? "" : coinsToAdd,
                onChange: (e) => setCoinsToAdd(Number(e.target.value)),
                placeholder: "مثال: 100 أو -50",
                className: "flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 text-left",
                dir: "ltr"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleUpdateCoins(selectedUser.id, selectedUser.coins),
                disabled: coinsToAdd === 0,
                className: "px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[10px] whitespace-nowrap",
                children: "تعديل الرصيد"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-1.5 pt-2 border-t border-zinc-200", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("label", { className: "block text-[9px] font-black uppercase tracking-widest text-zinc-400", children: "تخصيص رصيد محدد (قيمة مطلقة)" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-2", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "number",
                value: exactCoins,
                onChange: (e) => setExactCoins(e.target.value === "" ? "" : Number(e.target.value)),
                placeholder: "أدخل عدد العملات الكلي بالضبط...",
                className: "flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 text-left",
                dir: "ltr"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "button",
              {
                onClick: () => handleSetAbsoluteCoins(selectedUser.id, Number(exactCoins || 0)),
                disabled: exactCoins === "" || exactCoins < 0 || exactCoins === selectedUser.coins,
                className: "px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[10px] whitespace-nowrap",
                children: "تعيين الرصيد"
              }
            )
          ] })
        ] }),
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "pt-2 border-t border-zinc-200", children: /* @__PURE__ */ jsxRuntimeExports.jsxs(
          "button",
          {
            onClick: () => handleDeleteAllCoins(selectedUser.id),
            disabled: (selectedUser.coins || 0) === 0,
            className: "w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 font-extrabold rounded-xl transition-all text-[11px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
            children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3.5 h-3.5" }),
              "حذف وتصفير جميع عملات المستخدم كلياً"
            ]
          }
        ) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "pt-4 border-t border-zinc-200 space-y-2", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] font-black uppercase tracking-widest text-zinc-400", children: "سجل المعاملات والأرصدة الأخير" }),
          userTransactions.length === 0 ? /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-[10px] text-zinc-400 italic", children: "لا توجد معاملات مسجلة" }) : /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "space-y-1.5 max-h-[140px] overflow-y-auto pl-1", children: userTransactions.map((tx) => /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center justify-between p-2 bg-white rounded-lg text-xs border border-zinc-100", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "truncate max-w-[160px] text-zinc-600 text-right", children: tx.description || `تعديل (${tx.amount})` }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 shrink-0", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: `font-mono font-bold text-xs ${tx.amount > 0 ? "text-emerald-600" : "text-red-500"}`, children: [
                tx.amount > 0 ? "+" : "",
                tx.amount
              ] }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDeleteTransaction(tx.id, tx.amount), className: "text-zinc-300 hover:text-red-500 transition-colors", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-3 h-3" }) })
            ] })
          ] }, tx.id)) })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-4", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: () => handleBanUser(selectedUser.id, !selectedUser.banned),
            className: `flex-1 py-3 font-bold rounded-xl transition-colors ${selectedUser.banned ? "bg-emerald-500 text-black hover:bg-emerald-400" : "bg-orange-500 text-white hover:bg-orange-400"}`,
            children: selectedUser.banned ? "Unban User" : "Ban User"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "flex-1 py-3 bg-zinc-100 text-zinc-500 font-bold rounded-xl hover:bg-zinc-200 transition-colors", children: "View Activity" })
      ] })
    ] }) })
  ] });
};
export {
  UserManagement
};
