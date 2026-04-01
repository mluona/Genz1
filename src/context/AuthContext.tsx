import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { UserProfile } from '../types';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (uid: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('uid', uid)
        .single();

      if (error && error.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          const newProfile: UserProfile = {
            id: userData.user.id,
            username: userData.user.user_metadata.full_name || userData.user.email?.split('@')[0] || 'User',
            email: userData.user.email || '',
            bio: 'Reading is life.',
            profilePicture: userData.user.user_metadata.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.user.id}`,
            role: (userData.user.email === 'aynmluona@gmail.com' || userData.user.email === 'genz-manga@gmail.com') ? 'admin' : 'user',
            favorites: [],
            history: [],
            bookmarks: [],
            banned: false,
            coins: 0,
          };
          
          const { error: insertError } = await supabase
            .from('profiles')
            .insert([newProfile]);
            
          if (insertError) throw insertError;
          setProfile(newProfile);
        }
      } else if (error) {
        throw error;
      } else {
        setProfile(data as UserProfile);
      }
    } catch (error) {
      console.error('Error fetching/creating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const isAdmin = profile?.role === 'admin' || 
    user?.email?.toLowerCase() === 'aynmluona@gmail.com' || 
    user?.email?.toLowerCase() === 'genz-manga@gmail.com';

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
