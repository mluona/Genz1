import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Share2, Globe, Github, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const handleShare = async () => {
    const shareText = "شاهد افضل مانجا و الروايات على";
    const shareUrl = "https://genzmanhw.vercel.app/";

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'GENZ',
          text: shareText,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Share failed, fallback to copy:", err);
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    const text = "شاهد افضل مانجا و الروايات على https://genzmanhw.vercel.app/";
    navigator.clipboard.writeText(text);
    alert("تم نسخ رابط المشاركة بنجاح!");
  };

  return (
    <footer className="relative bg-zinc-950 border-t border-white/5 pt-12 pb-24 sm:pb-12 text-zinc-400 overflow-hidden text-right" dir="rtl">
      {/* Background ambient pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,185,129,0.04),transparent)] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-10 border-b border-white/5">
          {/* Logo */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-tighter text-white">GENZ</span>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleShare}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white hover:text-emerald-500 font-black rounded-xl text-[10px] transition-all border border-white/5"
              >
                <Share2 className="w-3.5 h-3.5 text-emerald-500" />
                شارِك GENZ
              </button>
              <a
                href="https://genzmanhw.vercel.app/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white hover:text-emerald-500 font-black rounded-xl text-[10px] transition-all border border-white/5"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-500" />
                الموقع الرسمي
              </a>
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="space-y-3 md:col-span-2">
            <h4 className="text-white text-xs font-black uppercase tracking-wider border-r-2 border-emerald-500 pr-2.5">روابط سريعة</h4>
            <ul className="space-y-2.5 text-xs text-zinc-400 font-bold">
              <li>
                <Link to="/" className="hover:text-emerald-500 transition-colors">الرئيسية</Link>
              </li>
              <li>
                <Link to="/manga" className="hover:text-emerald-500 transition-colors">أقسام المانجا</Link>
              </li>
              <li>
                <Link to="/manhwa" className="hover:text-emerald-500 transition-colors">مكتبة المانهوا</Link>
              </li>
              <li>
                <Link to="/novels" className="hover:text-emerald-500 transition-colors">أجدد الروايات</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright declaration */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 text-[11px] font-bold text-zinc-500">
          <div className="flex items-center gap-1 text-center sm:text-right flex-wrap justify-center">
            <span>جميع الحقوق محفوظة © {currentYear} موقع <span className="text-white font-black">GENZ</span>.</span>
            <span>بني بكل</span>
            <Heart className="w-3.5 h-3.5 text-emerald-500 fill-emerald-500/10 animate-pulse mx-0.5" />
            <span>لعشاق القصص والروايات المصورة.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
