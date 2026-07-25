import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, Clock } from 'lucide-react';
import { Series } from '../types';
import { formatDistanceToNow } from 'date-fns';

import { getProxiedImageUrl } from '../utils/imageUtils';

interface Props {
  series: Series;
  compact?: boolean;
}

export const SeriesCard: React.FC<Props> = ({ series, compact = false }) => {
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

  if (compact) {
    return (
      <Link to={`/series/${series.slug}`} className="group flex gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors flex-row-reverse text-right">
        <div className="w-16 h-20 flex-shrink-0 relative overflow-hidden rounded-lg">
          <img
            src={getProxiedImageUrl(series.coverImage)}
            alt={series.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col justify-center min-w-0 flex-1">
          <h4 className="text-sm font-bold text-white truncate text-right">{series.title}</h4>
          <div className="flex items-center gap-3 mt-1 text-[10px] font-medium text-zinc-500 uppercase tracking-wider flex-row-reverse justify-end">
            <span className="flex items-center gap-1 flex-row-reverse"><Eye className="w-3 h-3" /> {series.views.toLocaleString()}</span>
            <span className="flex items-center gap-1 text-emerald-500 flex-row-reverse"><Star className="w-3 h-3 fill-current" /> {series.rating.toFixed(1)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
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
        {isNew && (
          <div className="absolute top-3 right-3 flex flex-col gap-2 items-end">
            <span className="px-2 py-1 bg-white text-[10px] font-black text-black rounded-md uppercase tracking-tighter">
              جديد
            </span>
          </div>
        )}

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
        <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500 uppercase tracking-widest flex-row-reverse justify-end">
          <Clock className="w-3 h-3" />
          <span>
            {(() => {
              if (!series.lastUpdated) return 'غير معروف';
              try {
                const dateObj = new Date(series.lastUpdated);
                if (isNaN(dateObj.getTime())) return 'غير معروف';
                const result = formatDistanceToNow(dateObj, { addSuffix: true });
                return result
                  .replace('about ', 'تقريباً ')
                  .replace('over ', 'أكثر من ')
                  .replace('almost ', 'تقريباً ')
                  .replace('less than ', 'أقل من ')
                  .replace('a few seconds ago', 'منذ بضع ثوانٍ')
                  .replace('half a minute ago', 'منذ نصف دقيقة')
                  .replace('less than a minute ago', 'منذ أقل من دقيقة')
                  .replace(' minutes ago', ' دقائق مضت')
                  .replace(' minute ago', ' دقيقة مضت')
                  .replace(' hours ago', ' ساعات مضت')
                  .replace(' hour ago', ' ساعة مضت')
                  .replace(' days ago', ' أيام مضت')
                  .replace(' day ago', ' يوم مضت')
                  .replace(' months ago', ' أشهر مضت')
                  .replace(' month ago', ' شهر مضت')
                  .replace(' years ago', ' سنوات مضت')
                  .replace(' year ago', ' سنة مضت')
                  .replace('a minute ago', 'منذ دقيقة')
                  .replace('an hour ago', 'منذ ساعة')
                  .replace('a day ago', 'منذ يوم')
                  .replace('a month ago', 'منذ شهر')
                  .replace('a year ago', 'منذ سنة')
                  .replace('ago', 'مضت');
              } catch(e) {
                return 'غير معروف';
              }
            })()}
          </span>
        </div>
      </div>
    </Link>
  );
};
