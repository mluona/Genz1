import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { FileText, Plus, Edit2, Trash2, X, Globe } from 'lucide-react';

export const PageManagement: React.FC = () => {
  const [pages, setPages] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPage, setEditingPage] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    content: '',
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'pages'), (snapshot) => {
      setPages(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      lastUpdated: Timestamp.now(),
    };

    try {
      if (editingPage) {
        await updateDoc(doc(db, 'pages', editingPage.id), data);
      } else {
        await addDoc(collection(db, 'pages'), data);
      }
      setIsModalOpen(false);
      setEditingPage(null);
      setFormData({ title: '', slug: '', content: '' });
    } catch (error) {
      console.error("Error saving page:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Page Management</h1>
          <p className="text-zinc-500 font-medium">Create and edit static pages like Privacy Policy, TOS, etc.</p>
        </div>
        <button 
          onClick={() => { setEditingPage(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-black text-white font-bold rounded-2xl hover:bg-zinc-800 transition-colors"
        >
          <Plus className="w-5 h-5" /> Create New Page
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pages.map((page) => (
          <div key={page.id} className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-4 group">
            <div className="flex items-center justify-between">
              <div className="p-3 bg-zinc-100 rounded-2xl text-zinc-500 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => { setEditingPage(page); setFormData(page); setIsModalOpen(true); }}
                  className="p-2 text-zinc-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => deleteDoc(doc(db, 'pages', page.id))}
                  className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div>
              <h3 className="font-black text-lg">{page.title}</h3>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1">
                <Globe className="w-3 h-3" /> /{page.slug}
              </p>
            </div>
            <p className="text-sm text-zinc-500 line-clamp-2">{page.content}</p>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] shadow-2xl">
            <div className="p-8 border-b border-zinc-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-black uppercase tracking-tight">{editingPage ? 'Edit Page' : 'Create Page'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-zinc-400 hover:bg-zinc-100 rounded-full">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Page Title</label>
                  <input 
                    type="text" 
                    required
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Slug</label>
                  <input 
                    type="text" 
                    required
                    value={formData.slug}
                    onChange={e => setFormData({...formData, slug: e.target.value})}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Content (Markdown supported)</label>
                <textarea 
                  rows={12}
                  required
                  value={formData.content}
                  onChange={e => setFormData({...formData, content: e.target.value})}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 outline-none resize-none font-mono text-sm"
                />
              </div>
              <div className="flex justify-end gap-4 pt-6 border-t border-zinc-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-3 text-zinc-500 font-bold hover:bg-zinc-100 rounded-2xl">Cancel</button>
                <button type="submit" className="px-12 py-3 bg-black text-white font-bold rounded-2xl hover:bg-zinc-800">Save Page</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
