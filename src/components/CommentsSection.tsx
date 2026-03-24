import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firestore';
import { Comment } from '../types';
import { useAuthState } from 'react-firebase-hooks/auth';
import { formatDistanceToNow } from 'date-fns';
import { Heart, MessageSquare, AlertTriangle, Image as ImageIcon, Pin, MoreVertical, Trash2, Smile, ThumbsUp, Flame, Laugh } from 'lucide-react';

const REACTIONS = [
  { icon: ThumbsUp, label: '👍' },
  { icon: Heart, label: '❤️' },
  { icon: Flame, label: '🔥' },
  { icon: Laugh, label: '😂' },
];

interface CommentsSectionProps {
  seriesId: string;
  chapterId?: string;
  isAdmin?: boolean;
}

export default function CommentsSection({ seriesId, chapterId, isAdmin }: CommentsSectionProps) {
  const [user] = useAuthState(auth);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [showImageInput, setShowImageInput] = useState(false);
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());

  useEffect(() => {
    let q = query(
      collection(db, 'comments'),
      where('seriesId', '==', seriesId)
    );
    
    if (chapterId) {
      q = query(q, where('chapterId', '==', chapterId));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      let docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment));
      
      // Filter manually if chapterId is not provided to get series-level comments
      if (!chapterId) {
        docs = docs.filter(c => !c.chapterId);
      }

      // Sort by pinned first, then by total reactions, then by timestamp
      docs.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        
        const aReactions = Object.values(a.reactions || {}).reduce((sum, arr) => sum + arr.length, 0);
        const bReactions = Object.values(b.reactions || {}).reduce((sum, arr) => sum + arr.length, 0);
        
        if (bReactions !== aReactions) return bReactions - aReactions;
        return (b.timestamp?.toMillis() || 0) - (a.timestamp?.toMillis() || 0);
      });

      setComments(docs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'comments'));

    return () => unsubscribe();
  }, [seriesId, chapterId]);

  const handlePostComment = async () => {
    if (!user || !newComment.trim()) return;

    try {
      await addDoc(collection(db, 'comments'), {
        seriesId,
        chapterId: chapterId || null,
        userId: user.uid,
        username: user.displayName || 'Anonymous',
        userAvatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
        text: newComment.trim(),
        likes: 0,
        timestamp: serverTimestamp(),
        isSpoiler,
        imageUrl: imageUrl.trim() || null,
        reactions: {},
        isPinned: false
      }).catch(e => handleFirestoreError(e, OperationType.CREATE, 'comments'));
      setNewComment('');
      setIsSpoiler(false);
      setImageUrl('');
      setShowImageInput(false);
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleReaction = async (commentId: string, reaction: string, currentReactions: Record<string, string[]>) => {
    if (!user) return;
    
    try {
      const userReactions = currentReactions[reaction] || [];
      const hasReacted = userReactions.includes(user.uid);
      
      let newReactions = { ...currentReactions };
      
      if (hasReacted) {
        newReactions[reaction] = userReactions.filter(uid => uid !== user.uid);
        if (newReactions[reaction].length === 0) {
          delete newReactions[reaction];
        }
      } else {
        newReactions[reaction] = [...userReactions, user.uid];
      }

      await updateDoc(doc(db, 'comments', commentId), {
        reactions: newReactions
      }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `comments/${commentId}`));
    } catch (error) {
      console.error("Error updating reaction:", error);
    }
  };

  const handlePin = async (commentId: string, isPinned: boolean) => {
    if (!isAdmin) return;
    try {
      await updateDoc(doc(db, 'comments', commentId), {
        isPinned: !isPinned
      }).catch(e => handleFirestoreError(e, OperationType.UPDATE, `comments/${commentId}`));
    } catch (error) {
      console.error("Error pinning comment:", error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!isAdmin) return;
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    try {
      await deleteDoc(doc(db, 'comments', commentId))
        .catch(e => handleFirestoreError(e, OperationType.DELETE, `comments/${commentId}`));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const toggleSpoiler = (commentId: string) => {
    setRevealedSpoilers(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-3">
        <MessageSquare className="w-5 h-5 text-emerald-500" />
        Comments ({comments.length})
      </h3>

      {user ? (
        <div className="glass-panel p-4 sm:p-6 rounded-2xl space-y-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="What are your thoughts?"
            className="w-full bg-black/20 border border-white/10 rounded-xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none min-h-[100px]"
            dir="auto"
          />
          
          {showImageInput && (
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Paste image or GIF URL..."
              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
            />
          )}

          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white cursor-pointer transition-colors">
                <input
                  type="checkbox"
                  checked={isSpoiler}
                  onChange={(e) => setIsSpoiler(e.target.checked)}
                  className="rounded border-white/10 bg-black/20 text-emerald-500 focus:ring-emerald-500/50"
                />
                <AlertTriangle className="w-4 h-4" />
                Mark as Spoiler
              </label>
              
              <button 
                onClick={() => setShowImageInput(!showImageInput)}
                className={`flex items-center gap-2 text-sm transition-colors ${showImageInput || imageUrl ? 'text-emerald-500' : 'text-zinc-400 hover:text-white'}`}
              >
                <ImageIcon className="w-4 h-4" />
                Add Image/GIF
              </button>
            </div>
            
            <button
              onClick={handlePostComment}
              disabled={!newComment.trim()}
              className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-black font-bold rounded-xl transition-all text-sm uppercase tracking-widest"
            >
              Post Comment
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-2xl text-center">
          <p className="text-zinc-400">Please sign in to join the discussion.</p>
        </div>
      )}

      <div className="space-y-4">
        {comments.map(comment => {
          const isSpoilerHidden = comment.isSpoiler && !revealedSpoilers.has(comment.id);
          
          return (
            <div key={comment.id} className={`glass-panel p-4 sm:p-6 rounded-2xl transition-all ${comment.isPinned ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}>
              <div className="flex gap-3 sm:gap-4">
                <img src={comment.userAvatar || undefined} className="w-10 h-10 sm:w-12 sm:h-12 rounded-full shrink-0 border border-white/10" alt={comment.username} referrerPolicy="no-referrer" />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{comment.username}</span>
                      {comment.isPinned && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded-full">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">
                        {comment.timestamp ? formatDistanceToNow(comment.timestamp.toDate(), { addSuffix: true }) : 'Just now'}
                      </span>
                    </div>
                    
                    {isAdmin && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => handlePin(comment.id, !!comment.isPinned)} className="text-zinc-500 hover:text-emerald-500 transition-colors" title={comment.isPinned ? "Unpin" : "Pin"}>
                          <Pin className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(comment.id)} className="text-zinc-500 hover:text-red-500 transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {isSpoilerHidden ? (
                    <div 
                      onClick={() => toggleSpoiler(comment.id)}
                      className="bg-black/40 border border-white/5 rounded-xl p-4 cursor-pointer hover:bg-black/60 transition-colors flex flex-col items-center justify-center gap-2 my-2"
                    >
                      <AlertTriangle className="w-6 h-6 text-yellow-500" />
                      <span className="text-sm font-bold text-zinc-300">Spoiler Content</span>
                      <span className="text-xs text-zinc-500">Click to reveal</span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-zinc-300 text-sm sm:text-base leading-relaxed break-words" dir="auto">{comment.text}</p>
                      
                      {comment.imageUrl && (
                        <img 
                          src={comment.imageUrl} 
                          alt="Comment attachment" 
                          className="max-h-64 rounded-xl object-contain bg-black/20 border border-white/5"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      
                      {comment.isSpoiler && (
                        <button 
                          onClick={() => toggleSpoiler(comment.id)}
                          className="text-xs text-zinc-500 hover:text-white transition-colors"
                        >
                          Hide spoiler
                        </button>
                      )}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-white/5">
                    <button 
                      onClick={() => handleReaction(comment.id, '👍', comment.reactions || {})}
                      className={`text-xs font-bold flex items-center gap-1.5 transition-colors px-2 py-1 rounded-lg ${comment.reactions?.['👍']?.includes(user?.uid || '') ? 'bg-emerald-500/20 text-emerald-500' : 'text-zinc-500 hover:text-emerald-500 hover:bg-white/5'}`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${comment.reactions?.['👍']?.includes(user?.uid || '') ? 'fill-emerald-500/20' : ''}`} /> 
                      {comment.reactions?.['👍']?.length || 'Like'}
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {REACTIONS.slice(1).map(({ label }) => (
                         <button 
                          key={label}
                          onClick={() => handleReaction(comment.id, label, comment.reactions || {})}
                          className={`text-xs font-bold flex items-center gap-1.5 transition-colors px-2 py-1 rounded-lg ${comment.reactions?.[label]?.includes(user?.uid || '') ? 'bg-white/20 text-white' : 'text-zinc-500 hover:text-white hover:bg-white/5'}`}
                        >
                          <span className="text-sm">{label}</span>
                          {comment.reactions?.[label]?.length > 0 && <span>{comment.reactions[label].length}</span>}
                        </button>
                      ))}
                    </div>

                    <button className="text-xs font-bold text-zinc-500 hover:text-white transition-colors ml-auto">Reply</button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {comments.length === 0 && (
          <div className="text-center text-zinc-500 text-sm py-12 glass-panel rounded-2xl">
            No comments yet. Be the first to share your thoughts!
          </div>
        )}
      </div>
    </div>
  );
}
