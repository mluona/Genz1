import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Series } from '../types';
import { SeriesCard } from '../components/SeriesCard';
import { BookOpen, Search, Filter } from 'lucide-react';
import { motion } from 'motion/react';

export const Novels: React.FC = () => {
  const [novels, setNovels] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(
      collection(db, 'series'), 
      where('type', '==', 'Novel'),
      orderBy('lastUpdated', 'desc')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNovels(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Series)));
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const filteredNovels = novels.filter(novel => 
    novel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    novel.author?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Hero Section */}
        <div className="relative h-64 sm:h-80 rounded-[2.5rem] overflow-hidden bg-zinc-900 flex items-center justify-center text-center p-8">
          <div className="absolute inset-0 opacity-20">
            <img 
              src="https://picsum.photos/seed/novels/1920/1080" 
              className="w-full h-full object-cover" 
              alt="" 
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
          
          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/20">
              <BookOpen className="w-8 h-8 text-black" />
            </div>
            <h1 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic text-white">Light Novels</h1>
            <p className="text-zinc-400 font-medium max-w-lg mx-auto uppercase tracking-widest text-[10px]">Immerse yourself in epic stories and legendary adventures</p>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="relative w-full sm:w-96 group">
            <input 
              type="text" 
              placeholder="Search novels..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-zinc-900 transition-all"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" />
          </div>
          
          <div className="flex items-center gap-4 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            <span>{filteredNovels.length} Novels Found</span>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredNovels.length > 0 ? (
          <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 sm:gap-8">
            {filteredNovels.map((novel) => (
              <SeriesCard key={novel.id} series={novel} />
            ))}
          </div>
        ) : (
          <div className="text-center py-40">
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">No novels found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};
