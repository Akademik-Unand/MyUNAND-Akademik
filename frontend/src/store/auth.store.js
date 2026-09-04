import { create } from 'zustand';

const STORAGE_KEY = 'myunand_auth';

const emptySession = () => ({
  user: null,
  token: null,
  refreshToken: null,
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
      refreshToken: parsed.refreshToken || null,
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
    JSON.stringify({
      user: session.user,
      token: session.token || null,
      refreshToken: session.refreshToken || null,
    })
  );
};

const initial = readSession();

export const useAuthStore = create((set) => ({
  ...initial,

  login: (user, token = null, refreshToken = null) => {
    const session = { user, token, refreshToken, isAuthenticated: true };
    writeSession(session);
    set(session);
  },

  setTokens: (token, refreshToken) =>
    set((state) => {
      const session = {
        ...state,
        token: token ?? state.token,
        refreshToken: refreshToken ?? state.refreshToken,
        isAuthenticated: Boolean(state.user),
      };
      writeSession(session);
      return session;
    }),

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
