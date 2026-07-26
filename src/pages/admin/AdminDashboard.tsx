import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { Users, BookOpen, Layers, MessageSquare, TrendingUp, Eye, UserPlus, Star, Activity, Shield, Server, Zap } from 'lucide-react';
import { Series, UserProfile, Comment } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';

const initialChartData = () => {
  const data = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
    data.push({
      name: dayName,
      visitors: 0,
      views: 0
    });
  }
  return data;
};

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSeries: 0,
    totalChapters: 0,
    totalComments: 0,
    dailyVisitors: 0,
  });
  const [chartData, setChartData] = useState<any[]>(initialChartData());
  const [recentSeries, setRecentSeries] = useState<Series[]>([]);
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: usersCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        const { count: seriesCount } = await supabase
          .from('series')
          .select('*', { count: 'exact', head: true });
        
        const { count: commentsCount } = await supabase
          .from('comments')
          .select('*', { count: 'exact', head: true });

        // Fetch traffic for the last 7 days
        const last7Days: string[] = [];
        const daysMap: { [key: string]: { name: string; dateStr: string } } = {};
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().split('T')[0];
          const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
          last7Days.push(dateStr);
          daysMap[dateStr] = { name: dayName, dateStr };
        }

        const { data: trafficData } = await supabase
          .from('traffic')
          .select('*')
          .in('date', last7Days);

        const trafficList = (trafficData || []) as any[];

        // Aggregate by date
        const calculatedChartData = last7Days.map(dateStr => {
          const recordsForDay = trafficList.filter(r => r.date === dateStr);
          const uniqueIps = new Set(recordsForDay.map(r => r.ip));
          return {
            name: daysMap[dateStr]?.name || dateStr,
            visitors: uniqueIps.size,
            views: recordsForDay.length
          };
        });

        setChartData(calculatedChartData);

        // Calculate today's unique visitors
        const todayStr = new Date().toISOString().split('T')[0];
        const todayRecords = trafficList.filter(r => r.date === todayStr);
        const dailyVisitors = new Set(todayRecords.map(r => r.ip)).size;
        
        setStats(prev => ({
          ...prev,
          totalUsers: usersCount || 0,
          totalSeries: seriesCount || 0,
          totalComments: commentsCount || 0,
          dailyVisitors: dailyVisitors,
        }));

        const { data: seriesData } = await supabase
          .from('series')
          .select('*')
          .order('lastUpdated', { ascending: false })
          .limit(5);
        
        setRecentSeries((seriesData as Series[]) || []);

        const { data: usersData } = await supabase
          .from('profiles')
          .select('*')
          .order('id', { ascending: false }) // Assuming ID is sequential or just for recent
          .limit(5);
        
        setRecentUsers((usersData as unknown as UserProfile[]) || []);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'bg-blue-500' },
    { label: 'Total Series', value: stats.totalSeries, icon: BookOpen, color: 'bg-emerald-500' },
    { label: 'Total Comments', value: stats.totalComments, icon: MessageSquare, color: 'bg-purple-500' },
    { label: 'Daily Visitors', value: stats.dailyVisitors, icon: Eye, color: 'bg-orange-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Dashboard Overview</h1>
        <p className="text-zinc-500 font-medium">Welcome back! Here's what's happening with GENZ today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white p-4 sm:p-6 rounded-3xl border border-zinc-200 shadow-sm flex items-center gap-4 sm:gap-6">
            <div className={`p-4 ${stat.color} text-white rounded-2xl`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-2xl font-black">{stat.value.toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2 bg-white p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] border border-zinc-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-black uppercase tracking-tight">Traffic Overview</h3>
              <p className="text-xs text-zinc-500 font-medium">Visitor statistics for the last 7 days</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Visitors</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Views</span>
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#a1a1aa' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#18181b', 
                    border: 'none', 
                    borderRadius: '16px',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                />
                <Area type="monotone" dataKey="visitors" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVisitors)" />
                <Area type="monotone" dataKey="views" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-zinc-900 p-4 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-xl border border-white/5 space-y-8">
          <h3 className="text-white font-black uppercase tracking-tight">System Health</h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Main Server</p>
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Operational</p>
                </div>
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Security Layer</p>
                  <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Active</p>
                </div>
              </div>
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-xl">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-white text-sm font-bold">Content Delivery</p>
                  <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest">Active</p>
                </div>
              </div>
              <div className="w-2 h-2 bg-emerald-500 rounded-full" />
            </div>
          </div>

          <div className="pt-6 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Storage Usage</span>
              <span className="text-white text-[10px] font-black">42%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 w-[42%]" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Series */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-black uppercase tracking-tight text-sm sm:text-base">Recently Updated Series</h3>
            <button className="text-xs font-bold text-emerald-600 hover:underline whitespace-nowrap">View All</button>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentSeries.map((series) => (
              <div key={series.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <img src={series.coverImage || undefined} className="w-12 h-16 object-cover rounded-lg" alt="" referrerPolicy="no-referrer" />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{series.title}</p>
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest">{series.type} • {series.status}</p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-0 mt-2 sm:mt-0">
                  <p className="text-xs font-bold">{series.views.toLocaleString()} views</p>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-bold">{series.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-black uppercase tracking-tight text-sm sm:text-base">New Users</h3>
            <button className="text-xs font-bold text-emerald-600 hover:underline whitespace-nowrap">View All</button>
          </div>
          <div className="divide-y divide-zinc-100">
            {recentUsers.map((user) => (
              <div key={user.id} className="p-4 flex items-center gap-3 sm:gap-4 hover:bg-zinc-50 transition-colors">
                <img src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} className="w-10 h-10 rounded-full" alt="" referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate">{user.username}</p>
                  <p className="text-xs text-zinc-500 font-medium truncate">{user.email}</p>
                </div>
                <span className={`px-2 sm:px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-zinc-100 text-zinc-600'}`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
