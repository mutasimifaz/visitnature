import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

const ADMINS = (import.meta.env.VITE_ADMIN_EMAILS || '')
  .split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); }), []);

  const signIn = useCallback(async () => {
    try { await signInWithPopup(auth, googleProvider); return true; }
    catch (e) {
      if (e.code !== 'auth/popup-closed-by-user' && e.code !== 'auth/cancelled-popup-request')
        toast('Google sign-in failed. Check that Google is enabled in Firebase Auth and this domain is authorised.', 'error');
      return false;
    }
  }, [toast]);

  const logout = useCallback(() => signOut(auth).then(() => toast('You are signed out.')), [toast]);

  const value = useMemo(() => ({
    user, loading, signIn, logout,
    isAdmin: !!user?.email && ADMINS.includes(user.email.toLowerCase()),
  }), [user, loading, signIn, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
