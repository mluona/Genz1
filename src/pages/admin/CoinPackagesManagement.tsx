import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../utils/firestore';
import { Plus, Edit2, Trash2, X, Save, Coins } from 'lucide-react';

interface CoinPackage {
  id: string;
  name: string;
  coins: number;
  price: number;
  currency: string;
  bonusCoins?: number;
  isActive: boolean;
  createdAt: Timestamp;
}

export const CoinPackagesManagement: React.FC = () => {
  const [packages, setPackages] = useState<CoinPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    coins: 100,
    price: 1.00,
    currency: 'USD',
    bonusCoins: 0,
    isActive: true
  });

  useEffect(() => {
    const q = query(collection(db, 'coinPackages'), orderBy('price', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPackages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoinPackage)));
      setLoading(false);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'coinPackages'));

    return () => unsubscribe();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'coinPackages', editingId), {
          ...formData
        });
      } else {
        await addDoc(collection(db, 'coinPackages'), {
          ...formData,
          createdAt: Timestamp.now()
        });
      }
      setIsEditing(false);
      setEditingId(null);
      setFormData({ name: '', coins: 100, price: 1.00, currency: 'USD', bonusCoins: 0, isActive: true });
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, 'coinPackages');
    }
  };

  const handleEdit = (pkg: CoinPackage) => {
    setFormData({
      name: pkg.name,
      coins: pkg.coins,
      price: pkg.price,
      currency: pkg.currency || 'USD',
      bonusCoins: pkg.bonusCoins || 0,
      isActive: pkg.isActive
    });
    setEditingId(pkg.id);
    setIsEditing(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        await deleteDoc(doc(db, 'coinPackages', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `coinPackages/${id}`);
      }
    }
  };

  if (loading) {
    return <div className="p-8"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight mb-2">Coin Packages</h1>
          <p className="text-zinc-500">Manage currency purchase options for users.</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', coins: 100, price: 1.00, currency: 'USD', bonusCoins: 0, isActive: true });
            setIsEditing(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map(pkg => (
          <div key={pkg.id} className={`bg-white rounded-2xl p-6 border ${pkg.isActive ? 'border-zinc-200' : 'border-red-200 opacity-75'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                  <Coins className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{pkg.name}</h3>
                  <p className="text-zinc-500 text-sm">{pkg.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleEdit(pkg)} className="p-2 text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(pkg.id)} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Base Coins</span>
                <span className="font-bold">{pkg.coins}</span>
              </div>
              {pkg.bonusCoins > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Bonus Coins</span>
                  <span className="font-bold text-emerald-500">+{pkg.bonusCoins}</span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-zinc-100">
                <span className="text-zinc-500">Price</span>
                <span className="font-bold">{pkg.price} {pkg.currency}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingId ? 'Edit Package' : 'Add Package'}</h2>
              <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-zinc-700 mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="e.g. Starter Pack"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-1">Base Coins</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.coins}
                    onChange={e => setFormData({ ...formData, coins: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-1">Bonus Coins</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.bonusCoins}
                    onChange={e => setFormData({ ...formData, bonusCoins: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-1">Price</label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="0.01"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-1">Currency</label>
                  <input
                    type="text"
                    required
                    value={formData.currency}
                    onChange={e => setFormData({ ...formData, currency: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="USD"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-5 h-5 text-emerald-500 rounded focus:ring-emerald-500"
                />
                <label htmlFor="isActive" className="font-bold text-zinc-700">Package is Active</label>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 px-4 py-3 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
