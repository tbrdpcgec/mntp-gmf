// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

interface AuthContextType {
  user: any;
  email: string;
  role: string;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  email: '',
  role: '',
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    setUser(user);

    if (user) {
      const { data } = await supabase
        .from('user_profiles') // optional, kalau pakai role DB
        .select('role')
        .eq('id', user.id)
        .single();

      setRole(data?.role || '');
    } else {
      setRole('');
    }

    setLoading(false);
  };

  useEffect(() => {
    loadUser();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      loadUser();
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        email: user?.email || '',
        role,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
