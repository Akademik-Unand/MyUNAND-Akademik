import { describe, expect, it } from 'vitest';
import {
  EMPTY_ACADEMIC_FILTER,
  academicScopeLock,
  applyAcademicField,
  buildAcademicFilterFields,
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

  it('locks filter state for a single-unit prodi scope', () => {
    expect(academicScopeLock({ level: 'prodi', prodi_ids: ['p1'] })).toEqual({
      fakultasId: '',
      departemenId: '',
      prodiId: 'p1',
    });
  });

  it('leaves prodi empty for multi-unit prodi scope', () => {
    expect(academicScopeLock({ level: 'prodi', prodi_ids: ['p1', 'p2'] }).prodiId).toBe('');
  });

  it('does not lock anything for university admin', () => {
    expect(academicScopeLock({ level: 'universitas' })).toEqual({ fakultasId: '', departemenId: '', prodiId: '' });
  });

  it('limits options to the user prodi scope', () => {
    const options = cascadeAcademicOptions(
      {
        fakultas: [{ id: 'f1', nama_resmi: 'FT' }],
        departemen: [{ id: 'd1', fakultas_id: 'f1', nama_resmi: 'Informatika' }],
        prodi: [
          { id: 'p1', departemen_id: 'd1', nama_resmi: 'SI' },
          { id: 'p2', departemen_id: 'd1', nama_resmi: 'TI' },
        ],
        kurikulum: [
          { id: 'k1', program_studi_id: 'p1', nama: 'Kurikulum A' },
          { id: 'k2', program_studi_id: 'p2', nama: 'Kurikulum B' },
        ],
        semester: [],
      },
      EMPTY_ACADEMIC_FILTER,
      { level: 'prodi', prodi_ids: ['p1'] }
    );
    expect(options.prodi.map((row) => row.value)).toEqual(['p1']);
    expect(options.kurikulum.map((row) => row.value)).toEqual(['k1']);
  });

  it('disables fields above the user scope level', () => {
    const scope = { level: 'prodi', prodi_ids: ['p1'] };
    const fields = buildAcademicFilterFields({
      keys: ['fakultas', 'departemen', 'prodi', 'kurikulum'],
      draft: EMPTY_ACADEMIC_FILTER,
      options: {
        fakultas: [],
        departemen: [],
        prodi: [{ value: 'p1', label: 'SI' }],
        kurikulum: [],
      },
      onChange: () => {},
      scope,
    });
    expect(fields[0].disabled).toBe(true); // fakultas
    expect(fields[1].disabled).toBe(true); // departemen
    expect(fields[2].disabled).toBe(false); // prodi
    expect(fields[2].value).toBe('p1');
  });
});
