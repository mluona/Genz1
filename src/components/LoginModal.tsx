import React, { useState } from 'react';
import { X, Mail, Lock, Loader2, Github, Chrome } from 'lucide-react';
import { supabase } from '../supabase';
import { motion, AnimatePresence } from 'motion/react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        setMessage('تم إرسال رابط التأكيد إلى بريدك الإلكتروني! الرجاء التحقق من الرسائل الواردة.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        onClose();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = (await supabase.auth.signInWithOAuth({
        provider: 'google',
      })) as any;
      if (error) throw error;
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = (await supabase.auth.signInWithOAuth({
        provider: 'discord',
      })) as any;
      if (error) throw error;
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 pt-[15vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-[90%] sm:max-w-md bg-zinc-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto no-scrollbar"
          >
            <div className="relative p-6 sm:p-10">
              <div className="flex items-center justify-between mb-8">
                <div className="text-right">
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tighter text-white uppercase italic leading-none">
                    {isSignUp ? 'انضم إلينا' : 'مرحباً بك'}
                  </h2>
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mt-2">
                    {isSignUp ? 'أنشئ حسابك الجديد' : 'سجّل دخولك للوصول إلى مكتبتك'}
                  </p>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 sm:p-3 text-zinc-500 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl"
                >
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest leading-relaxed">{error}</p>
                </motion.div>
              )}

              {message && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl"
                >
                  <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-relaxed">{message}</p>
                </motion.div>
              )}

              <form onSubmit={handleEmailAuth} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] mr-1 block text-right">البريد الإلكتروني</label>
                  <div className="relative group">
                    <Mail className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-3.5 sm:py-4 pr-14 pl-6 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-zinc-700 text-right"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em] mr-1 block text-right">كلمة المرور</label>
                  <div className="relative group">
                    <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-emerald-500 transition-colors" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-950 border border-white/5 rounded-2xl py-3.5 sm:py-4 pr-14 pl-6 text-sm focus:outline-none focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 transition-all placeholder:text-zinc-700 text-right"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 sm:py-5 bg-emerald-500 disabled:bg-emerald-500/50 text-black font-black rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول')}
                </button>
              </form>

              <div className="relative my-8 sm:my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5"></div>
                </div>
                <div className="relative flex justify-center text-[9px] font-black uppercase tracking-[0.3em]">
                  <span className="bg-zinc-900 px-4 text-zinc-600">أو عبر الحسابات الاجتماعية</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                  className="py-4 bg-white/5 border border-white/10 hover:border-emerald-500/20 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
                >
                  <Chrome className="w-4 h-4 group-hover:text-emerald-500 transition-colors" />
                  جوجل
                </button>

                <button
                  type="button"
                  onClick={handleDiscordLogin}
                  disabled={loading}
                  className="py-4 bg-white/5 border border-white/10 hover:border-emerald-500/20 text-white font-black rounded-2xl uppercase tracking-[0.2em] text-[10px] hover:bg-white/10 transition-all flex items-center justify-center gap-2 group"
                >
                  <svg className="w-4 h-4 text-white group-hover:text-emerald-500 transition-colors fill-current" viewBox="0 0 24 24">
                    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.03c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.03A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.094 13.094 0 0 1-1.873-.894.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .077-.011c3.92 1.793 8.18 1.793 12.061 0a.073.073 0 0 1 .078.009c.12.099.246.195.373.289a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.156 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.156-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.156 2.418z" />
                  </svg>
                  ديسكورد
                </button>
              </div>

              <p className="mt-8 sm:mt-10 text-center text-[10px] font-black text-zinc-500 uppercase tracking-[0.15em]">
                {isSignUp ? 'هل لديك حساب بالفعل؟' : 'جديد في موقعنا؟'}{' '}
                <button
                  type="button"
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-emerald-500 hover:text-emerald-400 transition-colors underline underline-offset-4 whitespace-nowrap"
                >
                  {isSignUp ? 'سجّل الدخول من هنا' : 'سجّل الآن'}
                </button>
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>


  );
};
