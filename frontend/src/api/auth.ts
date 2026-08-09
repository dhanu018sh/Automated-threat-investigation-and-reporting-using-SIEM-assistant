import { apiClient } from './client';
import { User } from '../types';

export const authApi = {
  login: async (username: string, password: string): Promise<{ token: string; user: User }> => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      
      const res = await apiClient.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const token = res.data.access_token;
      const userRes = await apiClient.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      return { token, user: userRes.data };
    } catch (err: any) {
      // Fallback for offline demo mode
      if (username === 'analyst' && password === 'analyst123') {
        return {
          token: 'demo-jwt-token-analyst',
          user: { id: 'u1', username: 'analyst', role: 'analyst', email: 'analyst@siem.local' }
        };
      }
      if (username === 'manager' && password === 'manager123') {
        return {
          token: 'demo-jwt-token-manager',
          user: { id: 'u2', username: 'manager', role: 'soc_manager', email: 'manager@siem.local' }
        };
      }
      throw new Error(err.response?.data?.detail || 'Invalid username or password');
    }
  },

  getMe: async (): Promise<User> => {
    try {
      const res = await apiClient.get('/auth/me');
      return res.data;
    } catch {
      return { id: 'u1', username: 'analyst', role: 'analyst', email: 'analyst@siem.local' };
    }
  }
};
