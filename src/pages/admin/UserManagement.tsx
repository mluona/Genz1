import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, updateDoc, doc, deleteDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { UserProfile, UserRole } from '../../types';
import { Shield, Ban, Trash2, Search, MoreVertical, Filter, Calendar, Mail, User as UserIcon, CheckCircle, XCircle, Coins } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [coinsToAdd, setCoinsToAdd] = useState<number>(0);

  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUsers(snapshot.docs.map(d => ({ ...d.data() } as unknown as UserProfile)));
    });
    return () => unsubscribe();
  }, []);

  const handleRoleChange = async (uid: string, newRole: UserRole) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleBanUser = async (uid: string, isBanned: boolean) => {
    try {
      await updateDoc(doc(db, 'users', uid), { banned: isBanned });
    } catch (error) {
      console.error("Error banning user:", error);
    }
  };

  const handleUpdateCoins = async (uid: string, currentCoins: number = 0) => {
    if (coinsToAdd === 0) return;
    try {
      await updateDoc(doc(db, 'users', uid), { coins: currentCoins + coinsToAdd });
      setCoinsToAdd(0);
      // Update local selected user state to reflect changes immediately
      setSelectedUser(prev => prev ? { ...prev, coins: (prev.coins || 0) + coinsToAdd } : null);
    } catch (error) {
      console.error("Error updating coins:", error);
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
                <tr key={user.uid} className="hover:bg-zinc-50 transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={user.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} className="w-10 h-10 rounded-full shrink-0" alt="" referrerPolicy="no-referrer" />
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
                        onChange={(e) => handleRoleChange(user.uid, e.target.value as UserRole)}
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
                    {user.createdAt ? (user.createdAt as any).toDate().toLocaleDateString() : 'Unknown'}
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
                        onClick={() => handleBanUser(user.uid, !user.banned)}
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
                src={selectedUser.profilePicture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedUser.uid}`} 
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
                  {selectedUser.createdAt ? (selectedUser.createdAt as any).toDate().toLocaleDateString() : 'Unknown'}
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

            <div className="p-4 bg-zinc-50 rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <Coins className="w-3 h-3" /> Balance
                </p>
                <p className="text-sm font-bold text-amber-500">{selectedUser.coins || 0} Coins</p>
              </div>
              <div className="flex gap-2">
                <input 
                  type="number" 
                  value={coinsToAdd}
                  onChange={(e) => setCoinsToAdd(Number(e.target.value))}
                  placeholder="Amount to add/remove"
                  className="flex-1 bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button 
                  onClick={() => handleUpdateCoins(selectedUser.uid, selectedUser.coins)}
                  disabled={coinsToAdd === 0}
                  className="px-4 py-2 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Update
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 text-center">Use negative numbers to remove coins.</p>
            </div>

            <div className="flex gap-4">
              <button 
                onClick={() => handleBanUser(selectedUser.uid, !selectedUser.banned)}
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
