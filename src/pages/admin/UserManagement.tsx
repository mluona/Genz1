import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { UserProfile, UserRole, Transaction } from '../../types';
import { Shield, Ban, Trash2, Search, MoreVertical, Filter, Calendar, Mail, User as UserIcon, CheckCircle, XCircle, Coins } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [coinsToAdd, setCoinsToAdd] = useState<number>(0);
  const [exactCoins, setExactCoins] = useState<number | ''>('');

  useEffect(() => {
    if (selectedUser) {
      fetchUserTransactions(selectedUser.id);
      setExactCoins(selectedUser.coins || 0);
    }
  }, [selectedUser]);

  const fetchUserTransactions = async (uid: string) => {
    const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('userId', uid)
        .order('createdAt', { ascending: false });
    
    if (error) {
      console.error("Error fetching user transactions:", error);
      return;
    }
    setUserTransactions((data as Transaction[]) || []);
  };

  const handleDeleteTransaction = async (txId: string, amount: number) => {
      try {
        const { error: txError } = await supabase
            .from('transactions')
            .delete()
            .eq('id', txId);
        if (txError) throw txError;

        if (selectedUser) {
            const { error: profileError } = await supabase
                .from('profiles')
                .update({ coins: (selectedUser.coins || 0) - amount })
                .eq('id', selectedUser.id);
            if (profileError) throw profileError;
            
            setSelectedUser(prev => prev ? { ...prev, coins: (prev.coins || 0) - amount } : null);
            fetchUserTransactions(selectedUser.id);
            setExactCoins(selectedUser.coins ? selectedUser.coins - amount : 0);
        }
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*');
    
    if (error) {
      console.error("Error fetching users:", error);
      return;
    }
    setUsers((data as UserProfile[]) || []);
  };

  useEffect(() => {
    fetchUsers();

    const channel = supabase
      .channel('users_admin_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUsers();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', uid);
      if (error) throw error;
      fetchUsers();
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleBanUser = async (uid: string, isBanned: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ banned: isBanned })
        .eq('id', uid);
      if (error) throw error;
      fetchUsers();
      if (selectedUser && selectedUser.id === uid) {
        setSelectedUser(prev => prev ? { ...prev, banned: isBanned } : null);
      }
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };

  const handleUpdateCoins = async (uid: string, currentCoins: number = 0) => {
    if (coinsToAdd === 0) return;
    try {
      const newCoins = currentCoins + coinsToAdd;
      const { error } = await supabase
        .from('profiles')
        .update({ coins: newCoins })
        .eq('id', uid);
      if (error) throw error;

      await supabase
        .from('transactions')
        .insert([{
          userId: uid,
          amount: coinsToAdd,
          type: 'admin_adjustment',
          description: `تعديل رصيد بواسطة الإدارة: ${coinsToAdd > 0 ? '+' : ''}${coinsToAdd}`,
          timestamp: new Date().toISOString()
        }]);

      setCoinsToAdd(0);
      setSelectedUser(prev => prev ? { ...prev, coins: newCoins } : null);
      setExactCoins(newCoins);
      fetchUsers();
      fetchUserTransactions(uid);
    } catch (error) {
      console.error("Error updating coins:", error);
    }
  };

  const handleSetAbsoluteCoins = async (uid: string, targetCoins: number) => {
    if (targetCoins < 0) return;
    try {
      const difference = targetCoins - (selectedUser?.coins || 0);
      const { error } = await supabase
        .from('profiles')
        .update({ coins: targetCoins })
        .eq('id', uid);
      if (error) throw error;

      await supabase
        .from('transactions')
        .insert([{
          userId: uid,
          amount: difference,
          type: 'admin_adjustment',
          description: `تعديل رصيد مخصص من الإدارة إلى: ${targetCoins}`,
          timestamp: new Date().toISOString()
        }]);

      setSelectedUser(prev => prev ? { ...prev, coins: targetCoins } : null);
      setExactCoins(targetCoins);
      fetchUsers();
      fetchUserTransactions(uid);
      alert("تم تخصيص رصيد المستخدم بنجاح!");
    } catch (error) {
      console.error("Error setting absolute coins:", error);
    }
  };

  const handleDeleteAllCoins = async (uid: string) => {
    if (!window.confirm("هل أنت متأكد من رغبتك في حذف أو تصفير جميع عملات هذا المستخدم؟")) return;
    try {
      const difference = -(selectedUser?.coins || 0);
      const { error } = await supabase
        .from('profiles')
        .update({ coins: 0 })
        .eq('id', uid);
      if (error) throw error;

      await supabase
        .from('transactions')
        .insert([{
          userId: uid,
          amount: difference,
          type: 'admin_clearance',
          description: "تصفير الرصيد بالكامل بواسطة الإدارة",
          timestamp: new Date().toISOString()
        }]);

      setSelectedUser(prev => prev ? { ...prev, coins: 0 } : null);
      setExactCoins(0);
      fetchUsers();
      fetchUserTransactions(uid);
      alert("تم حذف وتصفير عملات المستخدم بالكامل!");
    } catch (error) {
      console.error("Error clearing user coins:", error);
    }
  };

  const filteredUsers = users.filter(u => {
    const name = u.username || (u as any).displayName || (u as any).name || 'Unknown';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">User Management</h1>
          <p className="text-zinc-500 font-medium">Manage user accounts, roles, and permissions.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <select 
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="w-full sm:w-auto bg-white border border-zinc-200 rounded-2xl py-2.5 pl-10 pr-8 text-sm outline-none appearance-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">All Roles</option>
              <option value="user">User</option>
              <option value="translator">Translator</option>
              <option value="proofreader">Proofreader</option>
              <option value="typesetter">Typesetter</option>
              <option value="editor">Editor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64 bg-white border border-zinc-200 rounded-2xl py-2.5 pl-10 pr-4 text-sm focus:ring-2 focus:ring-emerald-500/20 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-zinc-50 border-b border-zinc-200">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">User</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Role</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Joined</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Coins</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-zinc-50 transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} className="w-10 h-10 rounded-full shrink-0" alt="" referrerPolicy="no-referrer" />
                      <div className="min-w-0">
                        <p className="font-bold truncate">{user.username || (user as any).displayName || (user as any).name || 'Unknown'}</p>
                        <p className="text-xs text-zinc-500 font-medium truncate">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div onClick={e => e.stopPropagation()}>
                      <select 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                        className="bg-zinc-100 border-none rounded-lg px-3 py-1 text-xs font-bold outline-none"
                      >
                        <option value="user">User</option>
                        <option value="translator">Translator</option>
                        <option value="proofreader">Proofreader</option>
                        <option value="typesetter">Typesetter</option>
                        <option value="editor">Editor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-zinc-400 whitespace-nowrap">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-amber-500">
                    {user.coins || 0}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${user.banned ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-600'}`}>
                      {user.banned ? 'Banned' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => handleBanUser(user.id, !user.banned)}
                        className={`p-2 rounded-lg transition-colors ${user.banned ? 'text-emerald-500 hover:bg-emerald-50' : 'text-orange-500 hover:bg-orange-50'}`}
                        title={user.banned ? 'Unban User' : 'Ban User'}
                      >
                        <Ban className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl sm:rounded-[2.5rem] shadow-2xl p-6 sm:p-8 space-y-6 sm:space-y-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight">User Profile</h2>
              <button onClick={() => setSelectedUser(null)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="flex flex-col items-center text-center space-y-4">
              <img 
                src={selectedUser.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.id}`} 
                className="w-24 h-24 rounded-full border-4 border-zinc-100 shadow-lg" 
                alt="" 
                referrerPolicy="no-referrer"
              />
              <div>
                <h3 className="text-xl font-black">{selectedUser.username || (selectedUser as any).displayName || (selectedUser as any).name || 'Unknown'}</h3>
                <p className="text-zinc-500 font-medium">{selectedUser.email}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${selectedUser.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-zinc-100 text-zinc-600'}`}>
                {selectedUser.role}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-zinc-50 rounded-2xl space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Joined
                </p>
                <p className="text-sm font-bold">
                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
              <div className="p-4 bg-zinc-50 rounded-2xl space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Shield className="w-3 h-3" /> Status
                </p>
                <p className={`text-sm font-bold ${selectedUser.banned ? 'text-red-500' : 'text-emerald-500'}`}>
                  {selectedUser.banned ? 'Banned' : 'Active'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-zinc-50 rounded-2xl space-y-4 text-right animate-in fade-in duration-200" dir="rtl">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Coins className="w-3 h-3 text-amber-500" /> رصيد المستخدم الحالي
                </p>
                <p className="text-sm font-bold text-amber-500 font-mono">{selectedUser.coins || 0} عملة</p>
              </div>

              {/* Delta Coin Edit: Add or Remove coins */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-200">
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400">إضافة أو خصم رصيد (قيمة نسبية)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={coinsToAdd === 0 ? '' : coinsToAdd}
                    onChange={(e) => setCoinsToAdd(Number(e.target.value))}
                    placeholder="مثال: 100 أو -50"
                    className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 text-left"
                    dir="ltr"
                  />
                  <button 
                    onClick={() => handleUpdateCoins(selectedUser.id, selectedUser.coins)}
                    disabled={coinsToAdd === 0}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[10px] whitespace-nowrap"
                  >
                    تعديل الرصيد
                  </button>
                </div>
              </div>

              {/* Absolute Coin Edit: Set exact quantity of coins */}
              <div className="space-y-1.5 pt-2 border-t border-zinc-200">
                <label className="block text-[9px] font-black uppercase tracking-widest text-zinc-400">تخصيص رصيد محدد (قيمة مطلقة)</label>
                <div className="flex gap-2">
                  <input 
                    type="number" 
                    value={exactCoins}
                    onChange={(e) => setExactCoins(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="أدخل عدد العملات الكلي بالضبط..."
                    className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20 text-left"
                    dir="ltr"
                  />
                  <button 
                    onClick={() => handleSetAbsoluteCoins(selectedUser.id, Number(exactCoins || 0))}
                    disabled={exactCoins === '' || exactCoins < 0 || exactCoins === selectedUser.coins}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-[10px] whitespace-nowrap"
                  >
                    تعيين الرصيد
                  </button>
                </div>
              </div>

              {/* Danger section: Reset and delete all coins */}
              <div className="pt-2 border-t border-zinc-200">
                <button 
                  onClick={() => handleDeleteAllCoins(selectedUser.id)}
                  disabled={(selectedUser.coins || 0) === 0}
                  className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 hover:border-red-300 font-extrabold rounded-xl transition-all text-[11px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  حذف وتصفير جميع عملات المستخدم كلياً
                </button>
              </div>
              
              <div className="pt-4 border-t border-zinc-200 space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">سجل المعاملات والأرصدة الأخير</p>
                {userTransactions.length === 0 ? (
                  <p className="text-[10px] text-zinc-400 italic">لا توجد معاملات مسجلة</p>
                ) : (
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto pl-1">
                    {userTransactions.map(tx => (
                        <div key={tx.id} className="flex items-center justify-between p-2 bg-white rounded-lg text-xs border border-zinc-100">
                            <span className="truncate max-w-[160px] text-zinc-600 text-right">{tx.description || `تعديل (${tx.amount})`}</span>
                            <div className="flex items-center gap-2 shrink-0">
                                <span className={`font-mono font-bold text-xs ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                                </span>
                                <button onClick={() => handleDeleteTransaction(tx.id, tx.amount)} className="text-zinc-300 hover:text-red-500 transition-colors">
                                     <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => handleBanUser(selectedUser.id, !selectedUser.banned)}
                className={`flex-1 py-3 font-bold rounded-xl transition-colors ${selectedUser.banned ? 'bg-emerald-500 text-black hover:bg-emerald-400' : 'bg-orange-500 text-white hover:bg-orange-400'}`}
              >
                {selectedUser.banned ? 'Unban User' : 'Ban User'}
              </button>
              <button className="flex-1 py-3 bg-zinc-100 text-zinc-500 font-bold rounded-xl hover:bg-zinc-200 transition-colors">
                View Activity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
