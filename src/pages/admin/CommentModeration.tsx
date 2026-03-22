import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, doc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { Comment } from '../../types';
import { Trash2, MessageSquare, ShieldAlert, CheckCircle, Flag, Filter, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const CommentModeration: React.FC = () => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState<'all' | 'flagged'>('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);

  useEffect(() => {
    let q = query(collection(db, 'comments'), orderBy('timestamp', 'desc'));
    if (filter === 'flagged') {
      q = query(collection(db, 'comments'), where('isFlagged', '==', true), orderBy('timestamp', 'desc'));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Comment)));
    });
    return () => unsubscribe();
  }, [filter]);

  const handleDelete = async () => {
    if (commentToDelete) {
      try {
        await deleteDoc(doc(db, 'comments', commentToDelete));
        setIsDeleteModalOpen(false);
        setCommentToDelete(null);
      } catch (error) {
        console.error("Error deleting comment:", error);
      }
    }
  };

  const handleToggleFlag = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'comments', id), { isFlagged: !currentStatus });
    } catch (error) {
      console.error("Error toggling flag:", error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-black tracking-tight">Comment Moderation</h1>
        <p className="text-zinc-500 font-medium">Monitor and moderate user discussions across the site.</p>
      </div>

      <div className="bg-white rounded-3xl border border-zinc-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
          <h3 className="font-black uppercase tracking-tight">Recent Comments</h3>
          <div className="flex gap-2">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${filter === 'all' ? 'bg-zinc-800 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'}`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('flagged')}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${filter === 'flagged' ? 'bg-red-500 text-white' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
            >
              Flagged
            </button>
          </div>
        </div>
        <div className="divide-y divide-zinc-100">
          {comments.map((comment) => (
            <div key={comment.id} className={`p-6 flex gap-4 hover:bg-zinc-50 transition-colors ${comment.isFlagged ? 'bg-red-50/30' : ''}`}>
              <img src={comment.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.userId}`} className="w-10 h-10 rounded-full flex-shrink-0" alt="" referrerPolicy="no-referrer" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold">{comment.username}</span>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                      {comment.timestamp ? formatDistanceToNow(comment.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                    </span>
                    {comment.isFlagged && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-600 text-[8px] font-black uppercase tracking-widest rounded-full">
                        <ShieldAlert className="w-2 h-2" /> Flagged
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleToggleFlag(comment.id, !!comment.isFlagged)}
                      className={`p-2 rounded-lg transition-colors ${comment.isFlagged ? 'text-red-500 bg-red-50' : 'text-zinc-400 hover:text-red-500 hover:bg-red-50'}`}
                      title={comment.isFlagged ? 'Unflag' : 'Flag'}
                    >
                      <Flag className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => { setCommentToDelete(comment.id); setIsDeleteModalOpen(true); }}
                      className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">{comment.text}</p>
                <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                  <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Series: {comment.seriesId}</span>
                  {comment.chapterId && <span>Chapter: {comment.chapterId}</span>}
                </div>
              </div>
            </div>
          ))}
          {comments.length === 0 && (
            <div className="p-20 text-center text-zinc-400 font-bold">
              No comments found.
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto">
              <Trash2 className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Delete Comment?</h2>
              <p className="text-zinc-500 text-sm font-medium mt-2">This action cannot be undone. The comment will be permanently removed.</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="flex-1 py-3 text-zinc-500 font-bold hover:bg-zinc-100 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
