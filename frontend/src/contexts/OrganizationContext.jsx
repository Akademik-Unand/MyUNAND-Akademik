import { createContext, useContext, useEffect, useMemo } from 'react';
import { useAuthStore } from '../store/auth.store';
import { useOrganizationContextStore } from '../store/organizationContext.store';
import { useOrganizationOptions } from '../hooks/useOrganizationOptions';
import {
  emptyOrganizationContext,
  organizationContextLabel,
  organizationUserKey,
  reconcileOrganizationContext,
} from '../helpers/organizationContext';

const OrganizationContext = createContext(null);
const sameContext = (a, b) => a.fakultasId === b.fakultasId && a.departemenId === b.departemenId && a.prodiId === b.prodiId;

export const OrganizationProvider = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const userKey = organizationUserKey(user);
  const stored = useOrganizationContextStore((state) => state.contextsByUser[userKey]);
  const setContext = useOrganizationContextStore((state) => state.setContext);
  const organizationOptions = useOrganizationOptions();
  const context = stored || emptyOrganizationContext();

  useEffect(() => {
    if (!userKey || organizationOptions.isLoading || organizationOptions.isError) return;
    const reconciled = reconcileOrganizationContext(context, organizationOptions.rows);
    if (!sameContext(context, reconciled)) setContext(userKey, reconciled);
  }, [context, organizationOptions.isError, organizationOptions.isLoading, organizationOptions.rows, setContext, userKey]);

  const value = useMemo(() => ({
    context,
    setContext: (next) => setContext(userKey, reconcileOrganizationContext(next, organizationOptions.rows)),
    label: organizationContextLabel(context, organizationOptions.rows),
    ...organizationOptions,
  }), [context, organizationOptions, setContext, userKey]);

  return <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>;
};

export const useOrganizationContext = () => {
  const value = useContext(OrganizationContext);
  if (!value) throw new Error('useOrganizationContext harus digunakan di dalam OrganizationProvider.');
  return value;
};
