import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { emptyOrganizationContext } from '../helpers/organizationContext';

export const useOrganizationContextStore = create(
  persist(
    (set) => ({
      contextsByUser: {},
      setContext: (userKey, context) => {
        if (!userKey) return;
        set((state) => ({ contextsByUser: { ...state.contextsByUser, [userKey]: context } }));
      },
      clearContext: (userKey) => {
        if (!userKey) return;
        set((state) => {
          const contextsByUser = { ...state.contextsByUser };
          delete contextsByUser[userKey];
          return { contextsByUser };
        });
      },
    }),
    {
      name: 'myunand_organization_context',
      partialize: (state) => ({ contextsByUser: state.contextsByUser }),
    }
  )
);

export const selectOrganizationContext = (userKey) => (state) =>
  state.contextsByUser[userKey] || emptyOrganizationContext();
