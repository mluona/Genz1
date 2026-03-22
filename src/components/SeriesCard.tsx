import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Eye, Clock } from 'lucide-react';
import { Series } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface Props {
  series: Series;
  compact?: boolean;
}

export const SeriesCard: React.FC<Props> = ({ series, compact = false }) => {
  if (compact) {
    return (
      <Link to={`/series/${series.slug}`} className="group flex gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors">
        <div className="w-16 h-20 flex-shrink-0 relative overflow-hidden rounded-lg">
          <img
            src={series.coverImage || undefined}
            alt={series.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col justify-center min-w-0">
          <h4 className="text-sm font-bold text-white truncate">{series.title}</h4>
          <div className="flex items-center gap-3 mt-1 text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
            <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {series.views.toLocaleString()}</span>
            <span className="flex items-center gap-1 text-emerald-500"><Star className="w-3 h-3 fill-current" /> {series.rating.toFixed(1)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
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
        <div className="flex items-center gap-2 text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(series.lastUpdated.toDate(), { addSuffix: true })}
        </div>
      </div>
    </Link>
  );
};
