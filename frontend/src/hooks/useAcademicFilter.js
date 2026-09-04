import { useCallback, useMemo, useState } from 'react';
import { useFilterOptions } from './useFilterOptions';
import {
  EMPTY_ACADEMIC_FILTER,
  applyAcademicField,
  buildAcademicFilterFields,
  cascadeAcademicOptions,
  isAcademicDraftReady,
  toAcademicExtraFilter,
} from '../helpers/academicFilter';

const DEFAULT_KEYS = ['fakultas', 'departemen', 'prodi', 'kurikulum'];

export const useAcademicFilter = ({ keys = DEFAULT_KEYS } = {}) => {
  const raw = useFilterOptions();
  const [draft, setDraft] = useState(EMPTY_ACADEMIC_FILTER);
  const [applied, setApplied] = useState(EMPTY_ACADEMIC_FILTER);

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
        draft
      ),
    [raw.fakultasRows, raw.departemenRows, raw.prodiRows, raw.kurikulumRows, raw.semesterRows, draft]
  );

  const setField = useCallback((key, value) => setDraft((prev) => applyAcademicField(prev, key, value)), []);

  const fields = useMemo(
    () => buildAcademicFilterFields({ keys, draft, options, onChange: setField }),
    [keys, draft, options, setField]
  );

  const extraFilter = useMemo(() => toAcademicExtraFilter(applied, keys), [applied, keys]);

  return {
    draft,
    applied,
    fields,
    extraFilter,
    canApply: isAcademicDraftReady(draft),
    apply: () => setApplied({ ...draft }),
    reset: () => {
      setDraft(EMPTY_ACADEMIC_FILTER);
      setApplied(EMPTY_ACADEMIC_FILTER);
    },
  };
};
