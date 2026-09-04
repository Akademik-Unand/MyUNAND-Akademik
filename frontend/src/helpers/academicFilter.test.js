import { describe, expect, it } from 'vitest';
import {
  EMPTY_ACADEMIC_FILTER,
  applyAcademicField,
  cascadeAcademicOptions,
  isAcademicDraftReady,
  toAcademicExtraFilter,
} from './academicFilter';

describe('academicFilter', () => {
  it('clears child fields when a parent changes', () => {
    const next = applyAcademicField(
      {
        ...EMPTY_ACADEMIC_FILTER,
        fakultasId: 'f1',
        departemenId: 'd1',
        prodiId: 'p1',
        kurikulumId: 'k1',
      },
      'departemenId',
      'd2'
    );
    expect(next.departemenId).toBe('d2');
    expect(next.prodiId).toBe('');
    expect(next.kurikulumId).toBe('');
  });

  it('maps the deepest applied org filter', () => {
    expect(
      toAcademicExtraFilter({ ...EMPTY_ACADEMIC_FILTER, fakultasId: 'f1', prodiId: 'p1' }, [
        'fakultas',
        'departemen',
        'prodi',
        'kurikulum',
      ])
    ).toEqual({ program_studi_id: 'p1' });
  });

  it('adds semester without replacing the org filter', () => {
    expect(
      toAcademicExtraFilter(
        { ...EMPTY_ACADEMIC_FILTER, kurikulumId: 'k1', semesterId: 's1' },
        ['fakultas', 'departemen', 'prodi', 'kurikulum', 'semester']
      )
    ).toEqual({ kurikulum_id: 'k1', semester_id: 's1' });
  });

  it('cascades prodi by departemen', () => {
    const options = cascadeAcademicOptions(
      {
        fakultas: [{ id: 'f1', nama_resmi: 'FT' }],
        departemen: [
          { id: 'd1', fakultas_id: 'f1', nama_resmi: 'Informatika' },
          { id: 'd2', fakultas_id: 'f2', nama_resmi: 'Lain' },
        ],
        prodi: [
          { id: 'p1', departemen_id: 'd1', nama_resmi: 'SI' },
          { id: 'p2', departemen_id: 'd2', nama_resmi: 'TI' },
        ],
        kurikulum: [],
        semester: [],
      },
      { ...EMPTY_ACADEMIC_FILTER, fakultasId: 'f1', departemenId: 'd1' }
    );
    expect(options.departemen.map((row) => row.value)).toEqual(['d1']);
    expect(options.prodi.map((row) => row.value)).toEqual(['p1']);
  });

  it('treats empty draft as not ready to apply', () => {
    expect(isAcademicDraftReady(EMPTY_ACADEMIC_FILTER)).toBe(false);
    expect(isAcademicDraftReady({ ...EMPTY_ACADEMIC_FILTER, fakultasId: 'f1' })).toBe(true);
  });
});
