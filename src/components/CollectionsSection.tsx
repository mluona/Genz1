import React, { useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Compass,
  Swords,
  Sparkles,
  RotateCcw,
  Heart,
  Cpu,
  Flame,
  Eye,
  BookOpen,
} from 'lucide-react';
import { Series } from '../types';
import { getProxiedImageUrl } from '../utils/imageUtils';

interface CollectionsSectionProps {
  seriesList: Series[];
}

const GENRE_TRANSLATIONS: Record<string, string> = {
  Action: 'أكشن',
  Adventure: 'مغامرة',
  Comedy: 'كوميدي',
  Drama: 'دراما',
  Fantasy: 'خيالي',
  Horror: 'رعب',
  Mystery: 'غموض',
  Psychological: 'نفسي',
  Romance: 'رومانسي',
  'Sci-Fi': 'خيال علمي',
  'Slice of Life': 'شريحة من الحياة',
  Sports: 'رياضي',
  Supernatural: 'قوى خارقة',
  Thriller: 'إثارة',
  Chinese: 'صينية',
  Korean: 'كورية',
  Japanese: 'يابانية',
  Magic: 'سحر',
  'Time Travel': 'إعادة زمن',
  Isekai: 'ايسكاي',
  'Martial Arts': 'فنون قتالية',
  Reincarnation: 'إعادة تجسيد',
  Cultivation: 'زراعة قوى',
  'Video Games': 'ألعاب فيديو',
  Leveling: 'تطوير المستوى',
  System: 'نظام',
  Academy: 'أكاديمية',
  Tower: 'برج',
  Dungeons: 'دهاليز',
};

interface CollectionTemplate {
  id: string;
  title: string;
  description: string;
  matchGenres: string[];
  filterGenre: string;
  icon: React.ComponentType<{ className?: string }>;
}

const COLLECTION_TEMPLATES: CollectionTemplate[] = [
  {
    id: 'adventure',
    title: 'المغامرة',
    description: 'رحلات ملحمية، مستكشفون شجعان، وعوالم تنتظر من يكتشفها.',
    matchGenres: ['Adventure', 'مغامرة', 'Isekai', 'ايسكاي'],
    filterGenre: 'Adventure',
    icon: Compass,
  },
  {
    id: 'regression',
    title: 'العودة والتجسيد',
    description: 'فرصة ثانية للعودة بالزمن وتغيير مجرى المصير والأحداث.',
    matchGenres: ['Reincarnation', 'إعادة تجسيد', 'Time Travel', 'إعادة زمن'],
    filterGenre: 'Reincarnation',
    icon: RotateCcw,
  },
  {
    id: 'action',
    title: 'الأكشن والقتال',
    description: 'مواجهات حماسية، معارك ضارية، وصراعات لا تعرف التوقف.',
    matchGenres: ['Action', 'أكشن', 'Martial Arts', 'فنون قتالية'],
    filterGenre: 'Action',
    icon: Swords,
  },
  {
    id: 'fantasy',
    title: 'الخيال والسحر',
    description: 'عوالم سحرية شاسعة، قوى غامضة، وأساطير خالدة.',
    matchGenres: ['Fantasy', 'خيالي', 'Magic', 'سحر', 'Supernatural', 'قوى خارقة'],
    filterGenre: 'Fantasy',
    icon: Sparkles,
  },
  {
    id: 'system',
    title: 'النظام والتطوير',
    description: 'ارتقاء مستمر بالمستوى، مهام حاسمة، وقدرات تتطور مع كل تحدٍ.',
    matchGenres: ['System', 'نظام', 'Leveling', 'تطوير المستوى', 'Video Games', 'ألعاب فيديو', 'Dungeons', 'دهاليز', 'Tower', 'برج'],
    filterGenre: 'System',
    icon: Cpu,
  },
  {
    id: 'cultivation',
    title: 'صقل القوى',
    description: 'طريق القوة الأعلى، فنون القتال القديمة، وصعود الأسياد.',
    matchGenres: ['Cultivation', 'زراعة قوى', 'Chinese', 'صينية'],
    filterGenre: 'Cultivation',
    icon: Flame,
  },
  {
    id: 'romance',
    title: 'الرومانسية والدراما',
    description: 'مشاعر دافئة، علاقات عميقة، وقصص إنسانية مؤثرة.',
    matchGenres: ['Romance', 'رومانسي', 'Drama', 'دراما'],
    filterGenre: 'Romance',
    icon: Heart,
  },
  {
    id: 'mystery',
    title: 'الغموض والنفسي',
    description: 'ألغاز محيرة، صراعات ذهنية، وتقلبات غير متوقعة.',
    matchGenres: ['Mystery', 'غموض', 'Psychological', 'نفسي', 'Thriller', 'إثارة'],
    filterGenre: 'Mystery',
    icon: Eye,
  },
];

interface BuiltCollection {
  id: string;
  title: string;
  description: string;
  filterGenre: string;
  icon: React.ComponentType<{ className?: string }>;
  items: Series[];
  subTags: string[];
}

export const CollectionsSection: React.FC<CollectionsSectionProps> = ({ seriesList }) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const collections = useMemo<BuiltCollection[]>(() => {
    if (!seriesList || seriesList.length === 0) return [];

    const built: BuiltCollection[] = [];

    for (const tpl of COLLECTION_TEMPLATES) {
      const normalizedMatches = tpl.matchGenres.map((g) => g.toLowerCase());
      const matched = seriesList.filter((s) =>
        (s.genres || []).some((g) => normalizedMatches.includes(g.toLowerCase()))
      );

      if (matched.length === 0) continue;

      const tagCounts = new Map<string, number>();
      matched.forEach((s) => {
        (s.genres || []).forEach((g) => {
          const lower = g.toLowerCase();
          if (normalizedMatches.includes(lower)) return;
          const label = GENRE_TRANSLATIONS[g] || g;
          tagCounts.set(label, (tagCounts.get(label) || 0) + 1);
        });
      });

      const subTags = Array.from(tagCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 2)
        .map(([tag]) => tag);

      built.push({
        id: tpl.id,
        title: tpl.title,
        description: tpl.description,
        filterGenre: tpl.filterGenre,
        icon: tpl.icon,
        items: matched,
        subTags,
      });
    }

    // Fallback if database uses genres outside predefined templates
    if (built.length === 0) {
      const byGenre = new Map<string, Series[]>();
      seriesList.forEach((s) => {
        (s.genres || []).forEach((g) => {
          const list = byGenre.get(g) || [];
          list.push(s);
          byGenre.set(g, list);
        });
      });

      Array.from(byGenre.entries())
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 6)
        .forEach(([genre, items]) => {
          built.push({
            id: genre,
            title: GENRE_TRANSLATIONS[genre] || genre,
            description: `مجموعة مختارة من أعمال ${GENRE_TRANSLATIONS[genre] || genre}.`,
            filterGenre: genre,
            icon: BookOpen,
            items,
            subTags: [],
          });
        });
    }

    return built;
  }, [seriesList]);

  if (collections.length === 0) return null;

  const scrollByAmount = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const distance = Math.min(scrollRef.current.clientWidth * 0.85, 360);
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  return (
    <section className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight text-white">المجموعات</h2>
        <Link
          to="/library"
          className="flex items-center gap-1 text-sm font-bold text-zinc-400 hover:text-emerald-400 transition-colors"
        >
          <span>عرض الكل</span>
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* Horizontal Scroll Carousel */}
      <div className="relative group/col">
        <div
          ref={scrollRef}
          dir="ltr"
          className="flex gap-4 overflow-x-auto scroll-smooth hide-scrollbar pb-2 snap-x snap-mandatory"
        >
          {collections.map((col) => {
            const IconComponent = col.icon;
            const centerItem = col.items[0];
            const leftItem = col.items[1] || col.items[0];
            const rightItem = col.items[2] || col.items[1] || col.items[0];

            return (
              <Link
                key={col.id}
                to={`/library?genre=${encodeURIComponent(col.filterGenre)}`}
                dir="rtl"
                className="w-[295px] sm:w-[330px] md:w-[345px] shrink-0 snap-start rounded-2xl bg-zinc-900/75 hover:bg-zinc-900/95 border border-white/10 hover:border-white/20 transition-all pt-5 px-5 flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Card Header: Icon + Collection Title */}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/[0.06] border border-white/10 flex items-center justify-center text-white shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <h3 className="text-lg font-black text-white group-hover:text-emerald-400 transition-colors truncate">
                      {col.title}
                    </h3>
                  </div>

                  {/* Short Description */}
                  <p className="text-xs sm:text-[13px] text-zinc-400 leading-relaxed line-clamp-2 mt-3 min-h-[2.4rem]">
                    {col.description}
                  </p>

                  {/* Sub-tags */}
                  <div className="flex flex-wrap items-center gap-2 mt-3 min-h-[26px]">
                    {col.subTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-semibold text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Series Count */}
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 mt-3.5 tabular-nums">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{col.items.length}</span>
                  </div>
                </div>

                {/* Bottom Layered 3-Cover Fan */}
                <div
                  dir="ltr"
                  className="relative flex items-end justify-center mt-4 h-[150px] sm:h-[165px] -mx-1"
                >
                  {/* Left Cover */}
                  <div className="w-[34%] h-[126px] sm:h-[138px] rounded-t-xl overflow-hidden border border-white/10 bg-zinc-950 shadow-lg -mr-3 translate-y-1.5 opacity-90 shrink-0">
                    <img
                      src={getProxiedImageUrl(leftItem.coverImage)}
                      alt={leftItem.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>

                  {/* Center Cover (Front) */}
                  <div className="relative z-10 w-[40%] h-[150px] sm:h-[165px] rounded-t-xl overflow-hidden border border-white/15 bg-zinc-950 shadow-[0_0_28px_rgba(0,0,0,0.85)] shrink-0">
                    <img
                      src={getProxiedImageUrl(centerItem.coverImage)}
                      alt={centerItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>

                  {/* Right Cover */}
                  <div className="w-[34%] h-[126px] sm:h-[138px] rounded-t-xl overflow-hidden border border-white/10 bg-zinc-950 shadow-lg -ml-3 translate-y-1.5 opacity-90 shrink-0">
                    <img
                      src={getProxiedImageUrl(rightItem.coverImage)}
                      alt={rightItem.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Left / Right Circular Navigation Buttons */}
        {collections.length > 1 && (
          <div dir="ltr" className="pointer-events-none absolute inset-0 flex items-center justify-between px-1 sm:px-2">
            <button
              type="button"
              onClick={() => scrollByAmount('left')}
              aria-label="التمرير لليسار"
              className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-900/90 hover:bg-zinc-800 backdrop-blur-md text-white border border-white/15 shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <button
              type="button"
              onClick={() => scrollByAmount('right')}
              aria-label="التمرير لليمين"
              className="pointer-events-auto w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-900/90 hover:bg-zinc-800 backdrop-blur-md text-white border border-white/15 shadow-xl flex items-center justify-center transition-all active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
