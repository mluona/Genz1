import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Series, SeriesType } from '../types';
import { SeriesCard } from '../components/SeriesCard';
import { Search, Filter, LayoutGrid, List } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const GENRES = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 
  'Horror', 'Mystery', 'Psychological', 'Romance', 
  'Sci-Fi', 'Slice of Life', 'Sports', 'Supernatural', 'Thriller'
];

export const Library: React.FC = () => {
  const [seriesList, setSeriesList] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<SeriesType | 'All'>('All');
  const [selectedGenre, setSelectedGenre] = useState<string | 'All'>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const q = query(collection(db, 'series'), orderBy('title', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setSeriesList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Series)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filteredSeries = seriesList.filter(series => {
    const matchesSearch = series.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         series.author?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'All' || series.type === selectedType;
    const matchesGenre = selectedGenre === 'All' || series.genres?.includes(selectedGenre);
    return matchesSearch && matchesType && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic text-gradient">Library</h1>
            <p className="text-zinc-500 font-medium mt-2 uppercase tracking-widest text-xs">Explore our entire collection of works</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="relative group">
              <input 
                type="text" 
                placeholder="Search library..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-72 bg-zinc-900/50 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-zinc-900 transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
            </div>

            <div className="flex bg-zinc-900/50 p-1 rounded-2xl border border-white/5">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-white'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-xl transition-all ${viewMode === 'list' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-zinc-500 hover:text-white'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap gap-2">
            {['All', 'Manga', 'Manhwa', 'Novel'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as any)}
                className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedType === type ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGenre('All')}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedGenre === 'All' ? 'bg-white text-black' : 'bg-zinc-900/50 text-zinc-500 hover:text-white border border-white/5'}`}
            >
              All Genres
            </button>
            {GENRES.map((genre) => (
              <button
                key={genre}
                onClick={() => setSelectedGenre(genre)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedGenre === genre ? 'bg-white text-black' : 'bg-zinc-900/50 text-zinc-500 hover:text-white border border-white/5'}`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredSeries.length > 0 ? (
          <motion.div 
            layout
            className={viewMode === 'grid' 
              ? "grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 sm:gap-8"
              : "space-y-4"
            }
          >
            <AnimatePresence mode="popLayout">
              {filteredSeries.map((series) => (
                <motion.div
                  key={series.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <SeriesCard series={series} compact={viewMode === 'list'} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="text-center py-40 space-y-4">
            <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-8 h-8 text-zinc-700" />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tight">No results found</h3>
            <p className="text-zinc-500 max-w-xs mx-auto">Try adjusting your filters or search term to find what you're looking for.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedType('All'); setSelectedGenre('All'); }}
              className="text-emerald-500 font-black uppercase tracking-widest text-[10px] hover:underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
