import { useCallback, useMemo, useState } from 'react';
import { useFilterOptions } from './useFilterOptions';
import { useOrgScope } from './useOrgScope';
import {
  academicScopeLock,
  applyAcademicField,
  buildAcademicFilterFields,
  cascadeAcademicOptions,
  isAcademicDraftReady,
  toAcademicExtraFilter,
} from '../helpers/academicFilter';

const DEFAULT_KEYS = ['fakultas', 'departemen', 'prodi', 'kurikulum'];

export const useAcademicFilter = ({ keys = DEFAULT_KEYS, scope: scopeOverride } = {}) => {
  const raw = useFilterOptions();
  const ownScope = useOrgScope();
  const scope = scopeOverride || ownScope;
  const scoped = Boolean(scope?.level && scope.level !== 'universitas');

  const [draft, setDraft] = useState(() => academicScopeLock(scope));
  const [applied, setApplied] = useState(() => academicScopeLock(scope));

  const options = useMemo(
    () =>
      cascadeAcademicOptions(
        {
          fakultas: raw.fakultasRows,
          departemen: raw.departemenRows,
          prodi: raw.prodiRows,
          kurikulum: raw.kurikulumRows,
          semester: raw.semesterRows,
        },
        draft,
        scope
      ),
    [raw.fakultasRows, raw.departemenRows, raw.prodiRows, raw.kurikulumRows, raw.semesterRows, draft, scope]
  );

  const setField = useCallback((key, value) => setDraft((prev) => applyAcademicField(prev, key, value)), []);

  const fields = useMemo(
    () => buildAcademicFilterFields({ keys, draft, options, onChange: setField, scope }),
    [keys, draft, options, setField, scope]
  );

  const extraFilter = useMemo(() => {
    const base = toAcademicExtraFilter(applied, keys);
    if (base) return base;
    // User dengan scope unit: tetap buka daftar (server yang membatasi datanya).
    return scoped ? {} : undefined;
  }, [applied, keys, scoped]);

  return {
    draft,
    applied,
    fields,
    extraFilter,
    scope,
    canApply: isAcademicDraftReady(draft) || scoped,
    apply: () => setApplied({ ...draft }),
    reset: () => {
      setDraft(academicScopeLock(scope));
      setApplied(academicScopeLock(scope));
    },
  };
};