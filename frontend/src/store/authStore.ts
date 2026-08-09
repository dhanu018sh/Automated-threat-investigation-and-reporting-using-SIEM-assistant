import { create } from 'zustand';
import { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const initialToken = localStorage.getItem('siem_token');

export const useAuthStore = create<AuthState>((set) => ({
  user: initialToken ? { id: 'u1', username: 'analyst', role: 'analyst' } : null,
  token: initialToken,
  isAuthenticated: !!initialToken,
  login: (user, token) => {
    localStorage.setItem('siem_token', token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('siem_token');
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
