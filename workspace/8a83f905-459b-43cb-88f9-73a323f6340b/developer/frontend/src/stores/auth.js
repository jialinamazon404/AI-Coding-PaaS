import { defineStore } from 'pinia';
import { authApi } from '../api';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async register(username, password) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await authApi.register({ username, password });
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        return data;
      } catch (error) {
        this.error = error.response?.data?.message || '注册失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async login(username, password) {
      this.loading = true;
      this.error = null;
      try {
        const { data } = await authApi.login({ username, password });
        this.token = data.token;
        this.user = data.user;
        localStorage.setItem('token', data.token);
        return data;
      } catch (error) {
        this.error = error.response?.data?.message || '登录失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async checkAuth() {
      if (!this.token) return false;
      try {
        const { data } = await authApi.me();
        this.user = data.user;
        return true;
      } catch (error) {
        this.logout();
        return false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
    }
  }
});