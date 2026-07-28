import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, Lock } from 'lucide-react';
import { Series, Chapter } from '../types';
import { supabase } from '../supabase';
import { getProxiedImageUrl } from '../utils/imageUtils';
import { formatRelativeArabicDate } from '../utils/dateUtils';

interface Props {
  series: Series;
}

export const RecentlyUpdatedCard: React.FC<Props> = ({ series }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const isNew = (() => {
    const dateToUse = series.createdAt;
    if (!dateToUse) return false;
    try {
      const createdDate = new Date(dateToUse);
      const timeDiff = new Date().getTime() - createdDate.getTime();
      const daysDiff = timeDiff / (1000 * 3600 * 24);
      return daysDiff <= 3;
    } catch (e) {
      return false;
    }
  })();

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const { data, error } = await supabase
          .from('chapters')
          .select('*')
          .eq('seriesId', series.id)
          .order('chapterNumber', { ascending: false })
          .limit(3);
        
        if (error) throw error;
        setChapters((data as Chapter[]) || []);
      } catch (error) {
        console.error("Error fetching chapters for series", series.id, error);
      }
    };

    fetchChapters();
  }, [series.id]);

  return (
    <div className="flex flex-col gap-3">
      <Link to={`/series/${series.slug}`} className="group relative flex flex-col gap-3">
        <div className="aspect-[3/4] relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/5">
          <img
            src={getProxiedImageUrl(series.coverImage)}
            alt={series.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            <span className={`px-2 py-1 text-[10px] font-black text-white rounded-md uppercase tracking-tighter ${series.type === 'Novel' ? 'bg-blue-500' : 'bg-emerald-500 text-black'}`}>
              {series.type === 'Novel' ? 'رواية' : series.type === 'Manga' ? 'مانجا' : series.type === 'Manhwa' ? 'مانهوا' : series.type === 'Manhua' ? 'مانها' : series.type}
            </span>
            {isNew && (
              <span className="px-2 py-1 bg-white text-[10px] font-black text-black rounded-md uppercase tracking-tighter">
                جديد
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-row-reverse">
            <div className="flex items-center gap-1 text-xs font-bold flex-row-reverse">
              <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
              {series.rating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold flex-row-reverse">
              <Eye className="w-3 h-3" />
              {series.views > 1000 ? `${(series.views / 1000).toFixed(1)}k` : series.views}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-1 text-right">
          <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-emerald-400 transition-colors">
            {series.title}
          </h3>
        </div>
      </Link>

      {/* Chapters List */}
      <div className="flex flex-col gap-1 mt-1" dir="rtl">
        {chapters.map(chapter => (
          <Link 
            key={chapter.id} 
            to={`/series/${series.slug}/${chapter.chapterNumber}`}
            className="flex items-center justify-between group/chapter hover:bg-white/5 p-1.5 rounded-lg transition-colors flex-row-reverse"
          >
            <span className="text-xs font-bold text-zinc-300 group-hover/chapter:text-emerald-400 transition-colors truncate pl-2 flex items-center gap-1 flex-row-reverse">
              الفصل {chapter.chapterNumber}
              {chapter.isPremium && <Lock className="w-3 h-3 text-amber-500" />}
            </span>
            <span className="text-[10px] font-medium text-zinc-500 whitespace-nowrap">
              {formatRelativeArabicDate(chapter.publishDate)}
            </span>
          </Link>
        ))}
        {chapters.length === 0 && (
          <span className="text-xs text-zinc-600 italic px-1.5 text-right">لا توجد فصول بعد</span>
        )}
      </div>
    </div>
  );
};
