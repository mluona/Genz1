import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, Lock } from 'lucide-react';
import { Series, Chapter } from '../types';
import { formatDistanceToNow, format, differenceInDays } from 'date-fns';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Props {
  series: Series;
}

export const RecentlyUpdatedCard: React.FC<Props> = ({ series }) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    const fetchChapters = async () => {
      try {
        const q = query(
          collection(db, `series/${series.id}/chapters`),
          orderBy('chapterNumber', 'desc'),
          limit(3)
        );
        const snapshot = await getDocs(q);
        const fetchedChapters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chapter));
        setChapters(fetchedChapters);
      } catch (error) {
        console.error("Error fetching chapters for series", series.id, error);
      }
    };

    fetchChapters();
  }, [series.id]);

  const formatChapterDate = (date: Date) => {
    const daysDiff = differenceInDays(new Date(), date);
    if (daysDiff > 30) {
      return format(date, 'MMM d, yyyy');
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="flex flex-col gap-3">
      <Link to={`/series/${series.slug}`} className="group relative flex flex-col gap-3">
        <div className="aspect-[3/4] relative overflow-hidden rounded-2xl bg-zinc-900 border border-white/5">
          <img
            src={series.coverImage || undefined}
            alt={series.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span className={`px-2 py-1 text-[10px] font-black text-white rounded-md uppercase tracking-tighter ${series.type === 'Novel' ? 'bg-blue-500' : 'bg-emerald-500 text-black'}`}>
              {series.type}
            </span>
            {series.status === 'Ongoing' && (
              <span className="px-2 py-1 bg-white text-[10px] font-black text-black rounded-md uppercase tracking-tighter">
                New
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="flex items-center gap-1 text-xs font-bold">
              <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
              {series.rating.toFixed(1)}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold">
              <Eye className="w-3 h-3" />
              {series.views > 1000 ? `${(series.views / 1000).toFixed(1)}k` : series.views}
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-bold text-white line-clamp-2 leading-tight group-hover:text-emerald-400 transition-colors">
            {series.title}
          </h3>
        </div>
      </Link>

      {/* Chapters List */}
      <div className="flex flex-col gap-1 mt-1">
        {chapters.map(chapter => (
          <Link 
            key={chapter.id} 
            to={`/series/${series.slug}/${chapter.chapterNumber}`}
            className="flex items-center justify-between group/chapter hover:bg-white/5 p-1.5 rounded-lg transition-colors"
          >
            <span className="text-xs font-bold text-zinc-300 group-hover/chapter:text-emerald-400 transition-colors truncate pr-2 flex items-center gap-1">
              Ch. {chapter.chapterNumber}
              {chapter.isPremium && <Lock className="w-3 h-3 text-amber-500" />}
            </span>
            <span className="text-[10px] font-medium text-zinc-500 whitespace-nowrap">
              {formatChapterDate(chapter.publishDate.toDate())}
            </span>
          </Link>
        ))}
        {chapters.length === 0 && (
          <span className="text-xs text-zinc-600 italic px-1.5">No chapters yet</span>
        )}
      </div>
    </div>
  );
};
