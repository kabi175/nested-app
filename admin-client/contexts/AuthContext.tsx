'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Get token result to check custom claims
        try {
          const tokenResult = await firebaseUser.getIdTokenResult();
          const adminClaim = tokenResult.claims.admin === true || tokenResult.claims.role === 'ADMIN';
          setIsAdmin(adminClaim);
          
          // If user is not admin and not on login/unauthorized page, redirect
          const currentPath = window.location.pathname;
          if (!adminClaim && currentPath !== '/login' && currentPath !== '/unauthorized') {
            router.push('/unauthorized');
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
        // If not authenticated and not on login page, redirect to login
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          router.push('/login');
        }
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log(result);
      // Check if user has admin privileges
      const tokenResult = await result.user.getIdTokenResult();
      console.log('tokenResult', tokenResult);
      console.log('tokenResult.claims', tokenResult.claims);
      const adminClaim = tokenResult.claims.admin === true || tokenResult.claims.role === 'ADMIN';
      
      if (!adminClaim) {
        await signOut(auth);
        throw new Error('Access denied: Admin privileges required');
      }
      
      router.push('/');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

