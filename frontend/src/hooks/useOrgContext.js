import { useMemo } from 'react';
import { useOrganizationContext } from '../contexts/OrganizationContext';

/** Adapter ringkas untuk konsumsi konteks organisasi pada hook dan halaman fitur. */
export const useOrgContext = () => {
  const organization = useOrganizationContext();

  return useMemo(() => ({
    ...organization.context,
    setContext: organization.setContext,
    label: organization.label,
    rows: organization.rows,
    options: organization.options,
    isLoading: organization.isLoading,
    isError: organization.isError,
  }), [organization]);
};
