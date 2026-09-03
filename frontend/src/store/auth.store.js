import { create } from 'zustand';

const STORAGE_KEY = 'myunand_auth';

const emptySession = () => ({
  user: null,
  token: null,
  isAuthenticated: false,
});

const readSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptySession();
    const parsed = JSON.parse(raw);
    if (!parsed?.user) return emptySession();
    return {
      user: parsed.user,
      token: parsed.token || null,
      isAuthenticated: true,
    };
  } catch {
    return emptySession();
  }
};

const writeSession = (session) => {
  if (!session?.user) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ user: session.user, token: session.token || null })
  );
};

const initial = readSession();

export const useAuthStore = create((set) => ({
  ...initial,

  login: (user, token = null) => {
    const session = { user, token, isAuthenticated: true };
    writeSession(session);
    set(session);
  },

  setUser: (user) =>
    set((state) => {
      const session = { ...state, user, isAuthenticated: Boolean(user) };
      writeSession(session);
      return session;
    }),

  logout: () => {
    writeSession(null);
    set(emptySession());
  },
}));
