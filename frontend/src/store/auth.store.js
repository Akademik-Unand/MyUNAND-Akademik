import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: {
    id: 1,
    name: 'Jonas S.',
    email: 'admin@unand.ac.id',
    role: 'Administrator',
    roleName: 'Super Admin Kurikulum',
    faculty: 'Fakultas Teknik',
    university: 'Universitas Andalas',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
  },
  isAuthenticated: true,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
