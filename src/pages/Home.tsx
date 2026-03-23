import React, { useEffect, useState } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestore';
import { Series } from '../types';
import { SeriesCard } from '../components/SeriesCard';
import { RecentlyUpdatedCard } from '../components/RecentlyUpdatedCard';
import { TrendingUp, Clock, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

import { getProxiedImageUrl } from '../utils/imageUtils';

export const Home: React.FC = () => {
  const [recentlyUpdated, setRecentlyUpdated] = useState<Series[]>([]);
  const [dailyTop, setDailyTop] = useState<Series[]>([]);
  const [weeklyTop, setWeeklyTop] = useState<Series[]>([]);
  const [monthlyTop, setMonthlyTop] = useState<Series[]>([]);
  const [popularWorks, setPopularWorks] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTopTab, setActiveTopTab] = useState<'Daily' | 'Weekly' | 'Monthly'>('Daily');

  useEffect(() => {
    const recentQuery = query(collection(db, 'series'), limit(10));
    const dailyQuery = query(collection(db, 'series'), orderBy('dailyViews', 'desc'), limit(6));
    const weeklyQuery = query(collection(db, 'series'), orderBy('weeklyViews', 'desc'), limit(6));
    const monthlyQuery = query(collection(db, 'series'), orderBy('monthlyViews', 'desc'), limit(6));
    const popularQuery = query(collection(db, 'series'), orderBy('rating', 'desc'), limit(6));

    const unsubscribeRecent = onSnapshot(recentQuery, (snapshot) => setRecentlyUpdated(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Series))), (error) => { console.error("recentQuery error:", error); handleFirestoreError(error, OperationType.LIST, 'series'); });
    const unsubscribeDaily = onSnapshot(dailyQuery, (snapshot) => setDailyTop(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Series))), (error) => { console.error("dailyQuery error:", error); handleFirestoreError(error, OperationType.LIST, 'series'); });
    const unsubscribeWeekly = onSnapshot(weeklyQuery, (snapshot) => setWeeklyTop(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Series))), (error) => { console.error("weeklyQuery error:", error); handleFirestoreError(error, OperationType.LIST, 'series'); });
    const unsubscribeMonthly = onSnapshot(monthlyQuery, (snapshot) => setMonthlyTop(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Series))), (error) => { console.error("monthlyQuery error:", error); handleFirestoreError(error, OperationType.LIST, 'series'); });
    const unsubscribePopular = onSnapshot(popularQuery, (snapshot) => setPopularWorks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Series))), (error) => { console.error("popularQuery error:", error); handleFirestoreError(error, OperationType.LIST, 'series'); });

    setLoading(false);

    return () => {
      unsubscribeRecent();
      unsubscribeDaily();
      unsubscribeWeekly();
      unsubscribeMonthly();
      unsubscribePopular();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-20 selection:bg-emerald-500 selection:text-black">
      <div className="atmosphere" />
      
      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden flex items-center justify-center pb-32">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-950/50 to-zinc-950 z-10" />
        
        <motion.img
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10, ease: "linear" }}
          src="https://picsum.photos/seed/manhwa-hero/1920/1080"
          alt="Featured"
          className="w-full h-full object-cover opacity-30"
          referrerPolicy="no-referrer"
        />
        
        <div className="absolute z-20 text-center px-4 -mt-20">
          <h1 className="text-5xl sm:text-7xl font-black tracking-tighter mb-10 text-gradient">
            UNLEASH YOUR <span className="text-emerald-500 italic font-serif">IMAGINATION</span>
          </h1>
          <div className="flex gap-4 justify-center">
            <Link to="/library" className="px-8 py-4 bg-emerald-500 text-black font-black uppercase tracking-widest rounded-full hover:bg-emerald-400 transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:-translate-y-1">
              Start Reading
            </Link>
          </div>
        </div>

        {/* Floating Pages Marquee */}
        <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden py-12 pointer-events-none">
          <div className="flex gap-6 animate-marquee hover:[animation-play-state:paused] whitespace-nowrap opacity-80">
            {[...popularWorks, ...popularWorks].map((series, i) => (
              <motion.div
                key={`r1-${series.id}-${i}`}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
                className="shrink-0 pointer-events-auto"
              >
                <Link 
                  to={`/series/${series.slug}`}
                  className="inline-flex items-center gap-4 bg-zinc-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all group"
                >
                  <img 
                    src={getProxiedImageUrl(series.coverImage)} 
                    className="w-12 h-16 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform" 
                    alt="" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Popular #{ (i % popularWorks.length) + 1 }</p>
                    <p className="font-bold text-sm text-white">{series.title}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          <div className="flex gap-6 animate-marquee-reverse hover:[animation-play-state:paused] whitespace-nowrap mt-6 opacity-80">
            {[...recentlyUpdated, ...recentlyUpdated].map((series, i) => (
              <motion.div
                key={`r2-${series.id}-${i}`}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: i * 0.3, ease: "easeInOut" }}
                className="shrink-0 pointer-events-auto"
              >
                <Link 
                  to={`/series/${series.slug}`}
                  className="inline-flex items-center gap-4 bg-zinc-900/80 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 hover:border-emerald-500/50 hover:shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all group"
                >
                  <img 
                    src={getProxiedImageUrl(series.coverImage)} 
                    className="w-12 h-16 object-cover rounded-lg shadow-lg group-hover:scale-105 transition-transform" 
                    alt="" 
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">Updated</p>
                    <p className="font-bold text-sm text-white">{series.title}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-30 space-y-24 mt-12">
        
        {/* Recently Updated */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <Clock className="w-6 h-6 text-emerald-500" />
              <h2 className="text-2xl font-black uppercase tracking-tight">Recently Updated</h2>
            </div>
            <Link to="/library" className="flex items-center gap-1 text-sm font-bold text-zinc-400 hover:text-emerald-500 transition-colors">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {recentlyUpdated.slice(0, 10).map((series) => (
              <RecentlyUpdatedCard key={series.id} series={series} />
            ))}
          </div>
        </section>

        {/* Top Viewed */}
        <section className="bg-zinc-900/30 p-6 sm:p-8 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              <h2 className="text-2xl font-black uppercase tracking-tight">Top Viewed</h2>
            </div>
            
            {/* Tabs */}
            <div className="flex items-center gap-2 bg-zinc-950/50 p-1.5 rounded-2xl border border-white/5 overflow-x-auto hide-scrollbar">
              {(['Daily', 'Weekly', 'Monthly'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTopTab(tab)}
                  className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    activeTopTab === tab 
                      ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTopTab === 'Daily' ? dailyTop : activeTopTab === 'Weekly' ? weeklyTop : monthlyTop).map((series, i) => (
              <div key={series.id} className="flex items-center gap-4 group bg-zinc-950/30 p-4 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors">
                <span className={`text-4xl font-black w-10 text-center transition-colors ${
                  i === 0 ? 'text-emerald-500' : 
                  i === 1 ? 'text-blue-500' : 
                  i === 2 ? 'text-purple-500' : 
                  'text-zinc-800 group-hover:text-zinc-600'
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <SeriesCard series={series} compact />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Popular Works */}
        <section className="bg-zinc-900/50 border border-white/5 rounded-[3rem] p-8 md:p-12 hover:border-white/10 transition-colors">
          <div className="flex items-center gap-3 mb-12">
            <Star className="w-6 h-6 text-yellow-500" />
            <h2 className="text-3xl font-black uppercase tracking-tight">Popular Works</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {popularWorks.map((series) => (
              <SeriesCard key={series.id} series={series} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

