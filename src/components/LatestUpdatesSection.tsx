import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  LayoutGrid,
  CircleDollarSign,
  Flame,
  Heart,
  Check,
  Coins,
} from 'lucide-react';
import { Series, Chapter } from '../types';
import { getProxiedImageUrl } from '../utils/imageUtils';
import { formatRelativeArabicDate } from '../utils/dateUtils';

interface LatestUpdatesSectionProps {
  seriesList: Series[];
  chaptersBySeries: Record<string, Chapter[]>;
}

type UpdateFilter = 'all' | 'free' | 'action' | 'romance';

export const LatestUpdatesSection: React.FC<LatestUpdatesSectionProps> = ({
  seriesList,
  chaptersBySeries,
}) => {
  const [activeFilter, setActiveFilter] = useState<UpdateFilter>('all');

  const isRecentPublish = (dateInput?: string) => {
    if (!dateInput) return false;
    const ms = Date.now() - new Date(dateInput).getTime();
    return ms >= 0 && ms <= 48 * 60 * 60 * 1000;
  };

  const filteredSeries = useMemo(() => {
    const list = seriesList.filter((series) => {
      const genres = (series.genres || []).map((g) => g.toLowerCase());
      const seriesChapters = chaptersBySeries[series.id] || [];

      if (activeFilter === 'free') {
        if (seriesChapters.length === 0) return true;
        return !seriesChapters[0].isPremium;
      }
      if (activeFilter === 'action') {
        return genres.includes('action') || genres.includes('أكشن');
      }
      if (activeFilter === 'romance') {
        return genres.includes('romance') || genres.includes('رومانسي');
      }
      return true;
    });

    return list.slice(0, 10);
  }, [seriesList, chaptersBySeries, activeFilter]);

  const filterButtons: {
    id: UpdateFilter;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'all', label: 'جميع الأعمال', icon: LayoutGrid },
    { id: 'free', label: 'الأعمال المجانية', icon: CircleDollarSign },
    { id: 'action', label: 'أكشن', icon: Flame },
    { id: 'romance', label: 'رومانسي', icon: Heart },
  ];

  return (
    <section className="space-y-5">
      {/* Header Row */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight text-white">أحدث التحديثات</h2>
        <Link
          to="/library"
          className="flex items-center gap-1 text-sm font-bold text-zinc-400 hover:text-emerald-400 transition-colors"
        >
          <span>عرض الكل</span>
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>

      {/* 2x2 Filter Pill Bar */}
      <div className="bg-zinc-900/75 border border-white/10 rounded-2xl p-2 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {filterButtons.map((btn) => {
          const Icon = btn.icon;
          const isActive = activeFilter === btn.id;
          return (
            <button
              key={btn.id}
              type="button"
              onClick={() => setActiveFilter(btn.id)}
              className={`min-h-[42px] px-3.5 py-2 rounded-full text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                  : 'bg-white/[0.04] hover:bg-white/[0.08] text-zinc-300 border border-white/5'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{btn.label}</span>
              {isActive && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
            </button>
          );
        })}
      </div>

      {/* Updates Cards List */}
      {filteredSeries.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredSeries.map((series) => {
            const latestChapters = (chaptersBySeries[series.id] || []).slice(0, 4);
            const typeLabel = series.type === 'Novel' ? 'رواية' : series.type;

            return (
              <div
                key={series.id}
                className="bg-zinc-900/75 border border-white/10 rounded-2xl overflow-hidden flex flex-row min-h-[195px] sm:min-h-[210px] hover:border-white/20 transition-colors"
              >
                {/* Cover Column */}
                <Link
                  to={`/series/${series.slug}`}
                  className="w-[125px] sm:w-[150px] shrink-0 relative overflow-hidden bg-zinc-950 group"
                >
                  <img
                    src={getProxiedImageUrl(series.coverImage)}
                    alt={series.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <span className="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-bold border border-white/10">
                    {typeLabel}
                  </span>
                </Link>

                {/* Title & Latest Chapters Column */}
                <div className="flex-1 p-3.5 sm:p-4 flex flex-col justify-between min-w-0 text-right">
                  <Link
                    to={`/series/${series.slug}`}
                    className="text-sm sm:text-base font-bold text-white hover:text-emerald-400 transition-colors truncate block mb-1.5"
                    dir="auto"
                  >
                    {series.title}
                  </Link>

                  <div className="flex-1 flex flex-col justify-center divide-y divide-white/[0.07]">
                    {latestChapters.length > 0 ? (
                      latestChapters.map((chapter) => {
                        const isNew = isRecentPublish(chapter.publishDate);
                        return (
                          <Link
                            key={chapter.id}
                            to={`/series/${series.slug}/${chapter.chapterNumber}`}
                            className="py-2 flex items-center justify-between gap-2 text-xs sm:text-[13px] hover:bg-white/[0.03] px-1.5 -mx-1.5 rounded-lg transition-colors group/ch"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="font-semibold text-zinc-200 group-hover/ch:text-emerald-400 transition-colors truncate">
                                الفصل {chapter.chapterNumber}
                              </span>
                              {chapter.isPremium ? (
                                <Coins className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              ) : isNew ? (
                                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-bold text-zinc-200 shrink-0">
                                  جديد
                                </span>
                              ) : null}
                            </div>

                            <span className="text-[11px] text-zinc-400 whitespace-nowrap tabular-nums shrink-0">
                              {formatRelativeArabicDate(chapter.publishDate)}
                            </span>
                          </Link>
                        );
                      })
                    ) : (
                      <p className="text-xs text-zinc-500 py-4">لا توجد فصول منشورة بعد</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-zinc-900/50 border border-white/10 rounded-2xl py-10 px-6 text-center text-sm text-zinc-400">
          لا توجد أعمال مطابقة لهذا التصنيف حالياً
        </div>
      )}
    </section>
  );
};
