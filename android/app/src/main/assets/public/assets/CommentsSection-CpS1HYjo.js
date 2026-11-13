import { c as createLucideIcon, C as useAuth, r as reactExports, y as supabase, w as jsxRuntimeExports, D as LoginModal } from "./index-BNptM8td.js";
import { M as MessageSquare } from "./message-square-Cu1hVUrS.js";
import { I as Image } from "./image-Db96004O.js";
import { f as formatDistanceToNow } from "./formatDistanceToNow-K3QoIsIe.js";
import { T as Trash2 } from "./trash-2-C0MAntLE.js";
import { H as Heart } from "./heart-kEyEscBu.js";
import { F as Flame } from "./flame-DkKZUse_.js";
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$5 = [
  ["path", { d: "m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z", key: "1fy3hk" }]
];
const Bookmark = createLucideIcon("bookmark", __iconNode$5);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$4 = [
  ["circle", { cx: "12", cy: "12", r: "10", key: "1mglay" }],
  ["path", { d: "M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z", key: "b2q4dd" }],
  ["line", { x1: "9", x2: "9.01", y1: "9", y2: "9", key: "yxxnd0" }],
  ["line", { x1: "15", x2: "15.01", y1: "9", y2: "9", key: "1p4y9e" }]
];
const Laugh = createLucideIcon("laugh", __iconNode$4);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$3 = [
  ["path", { d: "M12 17v5", key: "bb1du9" }],
  [
    "path",
    {
      d: "M9 10.76a2 2 0 0 1-1.11 1.79l-1.78.9A2 2 0 0 0 5 15.24V16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-.76a2 2 0 0 0-1.11-1.79l-1.78-.9A2 2 0 0 1 15 10.76V7a1 1 0 0 1 1-1 2 2 0 0 0 0-4H8a2 2 0 0 0 0 4 1 1 0 0 1 1 1z",
      key: "1nkz8b"
    }
  ]
];
const Pin = createLucideIcon("pin", __iconNode$3);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$2 = [
  ["circle", { cx: "18", cy: "5", r: "3", key: "gq8acd" }],
  ["circle", { cx: "6", cy: "12", r: "3", key: "w7nqdw" }],
  ["circle", { cx: "18", cy: "19", r: "3", key: "1xt0gg" }],
  ["line", { x1: "8.59", x2: "15.42", y1: "13.51", y2: "17.49", key: "47mynk" }],
  ["line", { x1: "15.41", x2: "8.59", y1: "6.51", y2: "10.49", key: "1n3mei" }]
];
const Share2 = createLucideIcon("share-2", __iconNode$2);
/**
 * @license lucide-react v0.546.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode$1 = [
  ["path", { d: "M7 10v12", key: "1qc93n" }],
  [
    "path",
    {
      d: "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z",
      key: "emmmcr"
    }
  ]
];
const ThumbsUp = createLucideIcon("thumbs-up", __iconNode$1);
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
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const TriangleAlert = createLucideIcon("triangle-alert", __iconNode);
const REACTIONS = [
  { icon: ThumbsUp, label: "👍" },
  { icon: Heart, label: "❤️" },
  { icon: Flame, label: "🔥" },
  { icon: Laugh, label: "😂" }
];
function CommentsSection({ seriesId, chapterId, isAdmin }) {
  const { user, profile } = useAuth();
  const [comments, setComments] = reactExports.useState([]);
  const [newComment, setNewComment] = reactExports.useState("");
  const [isSpoiler, setIsSpoiler] = reactExports.useState(false);
  const [imageUrl, setImageUrl] = reactExports.useState("");
  const [showImageInput, setShowImageInput] = reactExports.useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = reactExports.useState(/* @__PURE__ */ new Set());
  const [isLoginModalOpen, setIsLoginModalOpen] = reactExports.useState(false);
  const fetchComments = async () => {
    try {
      let query = supabase.from("comments").select("*").eq("seriesId", seriesId);
      if (chapterId) {
        query = query.eq("chapterId", chapterId);
      } else {
        query = query.is("chapterId", null);
      }
      const { data, error } = await query;
      if (error) throw error;
      let docs = data || [];
      docs.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        const aReactions = Object.values(a.reactions || {}).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
        const bReactions = Object.values(b.reactions || {}).reduce((sum, arr) => sum + (Array.isArray(arr) ? arr.length : 0), 0);
        if (bReactions !== aReactions) return bReactions - aReactions;
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      });
      setComments(docs);
    } catch (error) {
      console.error("Error fetching comments:", error);
    }
  };
  reactExports.useEffect(() => {
    fetchComments();
    const channel = supabase.channel(`comments_${seriesId}_${chapterId || "series"}`).on("postgres_changes", {
      event: "*",
      schema: "public",
      table: "comments",
      filter: `seriesId=eq.${seriesId}`
    }, () => {
      fetchComments();
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [seriesId, chapterId]);
  const handlePostComment = async () => {
    if (!user || !newComment.trim() || !profile) return;
    try {
      const { error } = await supabase.from("comments").insert([{
        seriesId,
        chapterId: chapterId || null,
        userId: user.id,
        username: profile.username || "Anonymous",
        userAvatar: profile.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        text: newComment.trim(),
        likes: 0,
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        isSpoiler,
        imageUrl: imageUrl.trim() || null,
        reactions: {},
        isPinned: false
      }]);
      if (error) throw error;
      setNewComment("");
      setIsSpoiler(false);
      setImageUrl("");
      setShowImageInput(false);
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };
  const handleReaction = async (commentId, reaction, currentReactions) => {
    if (!user) {
      setIsLoginModalOpen(true);
      return;
    }
    try {
      const userReactions = currentReactions[reaction] || [];
      const hasReacted = userReactions.includes(user.id);
      let newReactions = { ...currentReactions };
      if (hasReacted) {
        newReactions[reaction] = userReactions.filter((uid) => uid !== user.id);
        if (newReactions[reaction].length === 0) {
          delete newReactions[reaction];
        }
      } else {
        newReactions[reaction] = [...userReactions, user.id];
      }
      const { error } = await supabase.from("comments").update({ reactions: newReactions }).eq("id", commentId);
      if (error) throw error;
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };
  const handlePin = async (commentId, isPinned) => {
    if (!isAdmin) return;
    try {
      const { error } = await supabase.from("comments").update({ isPinned: !isPinned }).eq("id", commentId);
      if (error) throw error;
    } catch (error) {
      console.error("Error pinning comment:", error);
    }
  };
  const handleDelete = async (commentId) => {
    if (!isAdmin) return;
    if (!window.confirm("Are you sure you want to delete this comment?")) return;
    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };
  const toggleSpoiler = (commentId) => {
    setRevealedSpoilers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(LoginModal, { isOpen: isLoginModalOpen, onClose: () => setIsLoginModalOpen(false) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("h3", { className: "text-xl font-black uppercase tracking-widest flex items-center gap-3 text-right", children: [
      "Comments (",
      comments.length,
      ")",
      /* @__PURE__ */ jsxRuntimeExports.jsx(MessageSquare, { className: "w-5 h-5 text-emerald-500" })
    ] }),
    user ? /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel p-4 sm:p-6 rounded-2xl space-y-4", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "textarea",
        {
          value: newComment,
          onChange: (e) => setNewComment(e.target.value),
          placeholder: "اكتب تعليقك أو رأيك هنا...",
          className: "w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none min-h-[100px] text-right",
          dir: "auto"
        }
      ),
      showImageInput && /* @__PURE__ */ jsxRuntimeExports.jsx(
        "input",
        {
          type: "url",
          value: imageUrl,
          onChange: (e) => setImageUrl(e.target.value),
          placeholder: "ضع رابط الصورة أو الـ GIF هنا...",
          className: "w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 text-right"
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-4 flex-row-reverse text-right", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx(
          "button",
          {
            onClick: handlePostComment,
            disabled: !newComment.trim(),
            className: "px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-black font-bold rounded-xl transition-all text-sm uppercase tracking-widest",
            children: "نشر التعليق"
          }
        ),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-4 flex-row-reverse", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("label", { className: "flex items-center gap-2 text-sm text-zinc-400 hover:text-white cursor-pointer transition-colors flex-row-reverse", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(
              "input",
              {
                type: "checkbox",
                checked: isSpoiler,
                onChange: (e) => setIsSpoiler(e.target.checked),
                className: "rounded border-white/10 bg-black/20 text-emerald-500 focus:ring-emerald-500/50"
              }
            ),
            /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-4 h-4 text-amber-500" }),
            "يتضمن حرقاً للأحداث"
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs(
            "button",
            {
              onClick: () => setShowImageInput(!showImageInput),
              className: `flex items-center gap-2 text-sm transition-colors flex-row-reverse ${showImageInput || imageUrl ? "text-emerald-500" : "text-zinc-400 hover:text-white"}`,
              children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx(Image, { className: "w-4 h-4" }),
                "إرفاق صورة/GIF"
              ]
            }
          )
        ] })
      ] })
    ] }) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "glass-panel p-6 rounded-2xl text-center", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-400 mb-4 text-sm sm:text-base", children: "الرجاء تسجيل الدخول للمشاركة في النقاشات والتعليقات." }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: () => setIsLoginModalOpen(true),
          className: "px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all text-sm uppercase tracking-widest",
          children: "تسجيل الدخول"
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-4", children: [
      comments.map((comment) => {
        var _a, _b, _c, _d, _e, _f;
        const isSpoilerHidden = comment.isSpoiler && !revealedSpoilers.has(comment.id);
        return /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: `glass-panel p-4 sm:p-6 rounded-2xl transition-all ${comment.isPinned ? "border-emerald-500/30 bg-emerald-500/5" : ""} text-right`, children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex gap-3 sm:gap-4 flex-row-reverse", children: [
          /* @__PURE__ */ jsxRuntimeExports.jsx("img", { src: comment.userAvatar || void 0, className: "w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0 border border-white/10", alt: comment.username, referrerPolicy: "no-referrer" }),
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex-1 min-w-0", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2 mb-2 flex-row-reverse", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 flex-row-reverse", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "font-bold text-white", children: comment.username }),
                comment.isPinned && /* @__PURE__ */ jsxRuntimeExports.jsxs("span", { className: "flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full", children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "w-3 h-3" }),
                  " مثبت 📌"
                ] }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-[10px] font-medium text-zinc-500 uppercase tracking-widest font-mono", children: comment.timestamp ? formatDistanceToNow(new Date(comment.timestamp), { addSuffix: true }) : "الآن" })
              ] }),
              isAdmin && /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2", children: [
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handlePin(comment.id, !!comment.isPinned), className: "text-zinc-500 hover:text-emerald-500 transition-colors", title: comment.isPinned ? "Unpin" : "Pin", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Pin, { className: "w-4 h-4" }) }),
                /* @__PURE__ */ jsxRuntimeExports.jsx("button", { onClick: () => handleDelete(comment.id), className: "text-zinc-500 hover:text-red-500 transition-colors", title: "Delete", children: /* @__PURE__ */ jsxRuntimeExports.jsx(Trash2, { className: "w-4 h-4" }) })
              ] })
            ] }),
            isSpoilerHidden ? /* @__PURE__ */ jsxRuntimeExports.jsxs(
              "div",
              {
                onClick: () => toggleSpoiler(comment.id),
                className: "bg-black/40 border border-white/5 rounded-xl p-4 cursor-pointer hover:bg-black/60 transition-colors flex flex-col items-center justify-center gap-2 my-2",
                children: [
                  /* @__PURE__ */ jsxRuntimeExports.jsx(TriangleAlert, { className: "w-6 h-6 text-amber-500 animate-pulse" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm font-bold text-zinc-300", children: "محتوى يحتوي على حرق للأحداث" }),
                  /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-xs text-emerald-500 uppercase tracking-wider", children: "اضغط للكشف عن المحتوى" })
                ]
              }
            ) : /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "space-y-3", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "text-zinc-300 text-sm sm:text-base leading-relaxed break-words", dir: "auto", children: comment.text }),
              comment.imageUrl && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "img",
                {
                  src: comment.imageUrl,
                  alt: "Comment attachment",
                  className: "max-h-64 rounded-xl object-contain bg-black/20 border border-white/5",
                  referrerPolicy: "no-referrer"
                }
              ),
              comment.isSpoiler && /* @__PURE__ */ jsxRuntimeExports.jsx(
                "button",
                {
                  onClick: () => toggleSpoiler(comment.id),
                  className: "text-xs text-zinc-500 hover:text-white transition-colors block mr-auto",
                  children: "إخفاء الحرق"
                }
              )
            ] }),
            /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/5 flex-row-reverse", children: [
              /* @__PURE__ */ jsxRuntimeExports.jsxs(
                "button",
                {
                  onClick: () => handleReaction(comment.id, "👍", comment.reactions || {}),
                  className: `text-xs font-bold flex items-center gap-1.5 transition-colors px-2 py-1 rounded-lg flex-row-reverse ${((_b = (_a = comment.reactions) == null ? void 0 : _a["👍"]) == null ? void 0 : _b.includes((user == null ? void 0 : user.id) || "")) ? "bg-emerald-500/20 text-emerald-500" : "text-zinc-500 hover:text-emerald-500 hover:bg-white/5"}`,
                  children: [
                    /* @__PURE__ */ jsxRuntimeExports.jsx(ThumbsUp, { className: `w-4 h-4 ${((_d = (_c = comment.reactions) == null ? void 0 : _c["👍"]) == null ? void 0 : _d.includes((user == null ? void 0 : user.id) || "")) ? "fill-emerald-500/20" : ""}` }),
                    ((_f = (_e = comment.reactions) == null ? void 0 : _e["👍"]) == null ? void 0 : _f.length) || "إعجاب"
                  ]
                }
              ),
              /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex items-center gap-2 flex-row-reverse", children: REACTIONS.slice(1).map(({ label }) => {
                var _a2, _b2, _c2, _d2;
                return /* @__PURE__ */ jsxRuntimeExports.jsxs(
                  "button",
                  {
                    onClick: () => handleReaction(comment.id, label, comment.reactions || {}),
                    className: `text-xs font-bold flex items-center gap-1.5 transition-colors px-2 py-1 rounded-lg flex-row-reverse ${((_b2 = (_a2 = comment.reactions) == null ? void 0 : _a2[label]) == null ? void 0 : _b2.includes((user == null ? void 0 : user.id) || "")) ? "bg-white/20 text-white" : "text-zinc-500 hover:text-white hover:bg-white/5"}`,
                    children: [
                      /* @__PURE__ */ jsxRuntimeExports.jsx("span", { className: "text-sm", children: label }),
                      ((_d2 = (_c2 = comment.reactions) == null ? void 0 : _c2[label]) == null ? void 0 : _d2.length) > 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: comment.reactions[label].length })
                    ]
                  },
                  label
                );
              }) }),
              /* @__PURE__ */ jsxRuntimeExports.jsx("button", { className: "text-xs font-bold text-zinc-500 hover:text-white transition-colors mr-auto", children: "رد" })
            ] })
          ] })
        ] }) }, comment.id);
      }),
      comments.length === 0 && /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-center text-zinc-500 text-sm py-12 glass-panel rounded-2xl", children: "لا توجد تعليقات بعد. كن أول من يشاركنا رأيه!" })
    ] })
  ] });
}
export {
  Bookmark as B,
  CommentsSection as C,
  Share2 as S
};
