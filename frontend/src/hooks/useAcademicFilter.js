import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFilterOptions } from './useFilterOptions';
import { useOrgScope } from './useOrgScope';
import { useOrgContext } from './useOrgContext';
import {
  academicScopeLock,
  applyAcademicField,
  buildAcademicFilterFields,
  cascadeAcademicOptions,
  isAcademicDraftReady,
  toAcademicExtraFilter,
} from '../helpers/academicFilter';

const DEFAULT_KEYS = ['fakultas', 'departemen', 'prodi', 'kurikulum'];
const GLOBAL_KEYS = new Set(['fakultas', 'departemen', 'prodi']);
const LOCAL_STATE_KEYS = { kurikulum: 'kurikulumId', semester: 'semesterId' };

const pickGlobal = (value = {}) => ({
  fakultasId: value.fakultasId || '',
  departemenId: value.departemenId || '',
  prodiId: value.prodiId || '',
});

export const useAcademicFilter = ({ keys = DEFAULT_KEYS, scope: scopeOverride } = {}) => {
  const raw = useFilterOptions();
  const ownScope = useOrgScope();
  const scope = scopeOverride || ownScope;
  const org = useOrgContext();
  const scoped = Boolean(scope?.level && scope.level !== 'universitas');
  const localKeys = keys.filter((key) => !GLOBAL_KEYS.has(key));
  const lockedGlobal = academicScopeLock(scope);
  const global = { ...pickGlobal(org), ...Object.fromEntries(Object.entries(lockedGlobal).filter(([, value]) => value)) };

  const [draftLocal, setDraftLocal] = useState({ kurikulumId: '', semesterId: '' });
  const [appliedLocal, setAppliedLocal] = useState({ kurikulumId: '', semesterId: '' });
  const draft = { ...global, ...draftLocal };
  const applied = { ...global, ...appliedLocal };

  useEffect(() => {
    setDraftLocal({ kurikulumId: '', semesterId: '' });
    setAppliedLocal({ kurikulumId: '', semesterId: '' });
  }, [global.fakultasId, global.departemenId, global.prodiId]);

  const options = useMemo(
    () => cascadeAcademicOptions({
      fakultas: raw.fakultasRows,
      departemen: raw.departemenRows,
      prodi: raw.prodiRows,
      kurikulum: raw.kurikulumRows,
      semester: raw.semesterRows,
    }, draft, scope),
    [raw.fakultasRows, raw.departemenRows, raw.prodiRows, raw.kurikulumRows, raw.semesterRows, draft.fakultasId, draft.departemenId, draft.prodiId, draft.kurikulumId, draft.semesterId, scope]
  );

  const setField = useCallback((key, value) => {
    if (GLOBAL_KEYS.has(keys.find((name) => ({ fakultas: 'fakultasId', departemen: 'departemenId', prodi: 'prodiId' })[name] === key))) {
      org.setContext(pickGlobal(applyAcademicField(global, key, value)));
      return;
    }
    setDraftLocal((prev) => {
      const next = applyAcademicField({ ...global, ...prev }, key, value);
      return { kurikulumId: next.kurikulumId, semesterId: next.semesterId };
    });
  }, [global.fakultasId, global.departemenId, global.prodiId, keys, org.setContext]);

  const fields = useMemo(
    () => buildAcademicFilterFields({ keys: localKeys, draft, options, onChange: setField, scope }),
    [localKeys.join('|'), draft.kurikulumId, draft.semesterId, draft.prodiId, options, setField, scope]
  );

  const extraFilter = useMemo(() => {
    const base = toAcademicExtraFilter(applied, keys);
    if (base) return base;
    return scoped ? {} : undefined;
  }, [applied.fakultasId, applied.departemenId, applied.prodiId, applied.kurikulumId, applied.semesterId, keys.join('|'), scoped]);

  return {
    draft,
    applied,
    fields,
    extraFilter,
    scope,
    canApply: isAcademicDraftReady(draft) || scoped,
    apply: () => setAppliedLocal({ ...draftLocal }),
    reset: () => {
      const empty = Object.fromEntries(localKeys.map((key) => [LOCAL_STATE_KEYS[key], '']).filter(([key]) => key));
      setDraftLocal((prev) => ({ ...prev, ...empty }));
      setAppliedLocal((prev) => ({ ...prev, ...empty }));
    },
  };
};
