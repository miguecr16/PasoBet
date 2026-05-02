import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import type { ApiResponse, User, Wallet } from '../types';

interface SignInCredentials {
  email: string;
  password: string;
}

interface SignUpData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

interface AuthContextData {
  user: User | null;
  wallet: Wallet | null;
  isLoading: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (data: SignUpData) => Promise<void>;
  signOut: () => void;
  refreshWallet: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshWallet = useCallback(async () => {
    try {
      // El interceptor devuelve la respuesta completa de axios → accedemos a .data
      const response = await api.get<ApiResponse<Wallet>>('/wallet');
      const body: ApiResponse<Wallet> = (response as any).data ?? response;
      if (body.success) {
        setWallet(body.data);
      }
    } catch {
      // Silently ignore wallet fetch errors
    }
  }, []);

  async function loadUser() {
    try {
      const token = localStorage.getItem('pasobet_token');
      if (!token) return;

      const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
      const body: ApiResponse<{ user: User }> = (response as any).data ?? response;
      if (body.success) {
        setUser(body.data.user);
        await refreshWallet();
      }
    } catch {
      localStorage.removeItem('pasobet_token');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadUser();
  }, [refreshWallet]);

  async function signIn(credentials: SignInCredentials) {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/login', credentials);
    const body: ApiResponse<{ token: string; user: User }> = (response as any).data ?? response;

    if (body.success) {
      localStorage.setItem('pasobet_token', body.data.token);
      setUser(body.data.user);
      await refreshWallet();
    } else {
      throw new Error(body.message || 'Error al iniciar sesión');
    }
  }

  async function signUp(data: SignUpData) {
    const response = await api.post<ApiResponse<{ token: string; user: User }>>('/auth/register', data);
    const body: ApiResponse<{ token: string; user: User }> = (response as any).data ?? response;

    if (body.success) {
      localStorage.setItem('pasobet_token', body.data.token);
      setUser(body.data.user);
      await refreshWallet();
    } else {
      throw new Error(body.message || 'Error al registrarse');
    }
  }

  function signOut() {
    localStorage.removeItem('pasobet_token');
    setUser(null);
    setWallet(null);
  }

  return (
    <AuthContext.Provider value={{ user, wallet, isLoading, signIn, signUp, signOut, refreshWallet }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
