import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const DiscordIcon = () => (
  <svg className="w-5 h-5 fill-current" viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg">
    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.88-.65,1.72-1.34,2.51-2a75.58,75.58,0,0,0,73,0c.79.69,1.63,1.39,2.51,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31-18.83C129.81,49.11,123.4,26.47,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53S36.18,40.36,42.45,40.36,53.9,46,53.9,53,48.72,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53S78.41,40.36,84.69,40.36,96.14,46,96.14,53,91,65.69,84.69,65.69Z" />
  </svg>
);

export const Footer: React.FC = () => {
  const [isDmcaOpen, setIsDmcaOpen] = useState(false);

  return (
    <footer className="relative bg-zinc-950 border-t border-white/5 py-14 px-6 text-center" dir="rtl">
      <div className="max-w-lg mx-auto flex flex-col items-center">
        {/* Circular Brand Emblem */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400 via-emerald-500 to-emerald-700 flex items-center justify-center shadow-[0_0_28px_rgba(16,185,129,0.3)] border border-white/20 select-none">
          <span className="text-2xl font-black italic tracking-tighter text-black">G</span>
        </div>

        {/* Brand Name */}
        <h3 className="text-2xl font-black tracking-tight text-white mt-4">GENZ</h3>

        {/* Brand Description */}
        <p className="text-sm leading-relaxed text-zinc-300 mt-3 max-w-md">
          منصة متخصصة في تقديم ترجمات عالية الجودة، لتوفير أفضل تجربة قراءة لعشاق الروايات والقصص. استمتع بمكتبة واسعة من الأعمال المحدثة باستمرار لتجربة قراءة مميزة.
        </p>

        {/* Discord Icon Button */}
        <a
          href="https://discord.gg/effXNBHsT"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Discord"
          className="mt-7 w-11 h-11 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-white flex items-center justify-center transition-colors"
        >
          <DiscordIcon />
        </a>

        {/* DMCA Button */}
        <button
          type="button"
          onClick={() => setIsDmcaOpen(true)}
          className="mt-4 px-7 py-2.5 rounded-full bg-white/[0.08] hover:bg-white/[0.15] border border-white/10 text-xs font-bold text-white transition-colors cursor-pointer"
        >
          DMCA
        </button>
      </div>

      {/* DMCA Modal */}
      <AnimatePresence>
        {isDmcaOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="relative w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl p-6 text-right space-y-4 shadow-2xl"
              dir="rtl"
            >
              <button
                type="button"
                onClick={() => setIsDmcaOpen(false)}
                aria-label="إغلاق"
                className="absolute top-4 left-4 p-1.5 text-zinc-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
                <h4 className="text-lg font-bold text-white">سياسة حقوق النشر (DMCA)</h4>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed">
                يحترم موقع GENZ حقوق الملكية الفكرية للناشرين والمؤلفين. إذا كنت مالك حقوق طبع ونشر وتعتقد أن أي محتوى منشور ينتهك حقوقك، يرجى التواصل معنا عبر خادم Discord الرسمي مرفقاً بالروابط والتفاصيل اللازمة لإزالة المحتوى فوراً.
              </p>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsDmcaOpen(false)}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold transition-colors cursor-pointer"
                >
                  حسناً
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </footer>
  );
};

