'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
  avatar?: string;
}

interface LoginResult {
  success: boolean;
  message?: string;
  requiresVerification?: boolean;
  email?: string;
}

interface RegisterResult {
  success: boolean;
  message?: string;
  requiresVerification?: boolean;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  register: (data: RegisterData) => Promise<RegisterResult>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<{ success: boolean; message?: string }>;
  resendVerification: (email: string, lang?: string) => Promise<{ success: boolean; message?: string }>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  lang?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'oh_elearning_token';
const USER_KEY = 'oh_elearning_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Charger le token depuis localStorage au démarrage
  useEffect(() => {
    const savedToken = localStorage.getItem(TOKEN_KEY);
    const savedUser = localStorage.getItem(USER_KEY);

    if (savedToken && savedUser) {
      setToken(savedToken);
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem(USER_KEY);
      }
      // Vérifier que le token est encore valide
      verifyToken(savedToken);
    } else {
      setIsLoading(false);
    }
  }, []);

  const verifyToken = async (tokenToVerify: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${tokenToVerify}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setUser(data.data);
          localStorage.setItem(USER_KEY, JSON.stringify(data.data));
        }
      } else {
        // Token invalide, déconnexion
        logout();
      }
    } catch (error) {
      console.error('Token verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.success && data.data?.token) {
        const { token: newToken, user: newUser } = data.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem(TOKEN_KEY, newToken);
        localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        return { success: true };
      } else {
        // Check if email verification is required
        if (data.requiresVerification) {
          return {
            success: false,
            message: data.message || 'Email not verified',
            requiresVerification: true,
            email: data.email
          };
        }
        return { success: false, message: data.message || 'Erreur de connexion' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  }, []);

  const register = useCallback(async (registerData: RegisterData): Promise<RegisterResult> => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const data = await res.json();

      if (data.success) {
        // New flow: registration requires email verification
        if (data.requiresVerification) {
          return {
            success: true,
            message: data.message,
            requiresVerification: true
          };
        }
        // Legacy flow (if no verification required)
        if (data.data?.token) {
          const { token: newToken, user: newUser } = data.data;
          setToken(newToken);
          setUser(newUser);
          localStorage.setItem(TOKEN_KEY, newToken);
          localStorage.setItem(USER_KEY, JSON.stringify(newUser));
        }
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Erreur d\'inscription' };
      }
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  }, []);

  const resendVerification = useCallback(async (email: string, lang = 'fr') => {
    try {
      const res = await fetch(`${API_URL}/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, lang }),
      });

      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Resend verification error:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }, []);

  const updateProfile = useCallback(async (profileData: Partial<User>) => {
    if (!token) {
      return { success: false, message: 'Non authentifié' };
    }

    try {
      const res = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (data.success) {
        const updatedUser = { ...user, ...profileData } as User;
        setUser(updatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        return { success: true };
      } else {
        return { success: false, message: data.message || 'Erreur de mise à jour' };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: 'Erreur de connexion au serveur' };
    }
  }, [token, user]);

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    resendVerification,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
