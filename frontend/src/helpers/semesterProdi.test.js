import { describe, expect, it } from 'vitest';
import { semesterDanSebelumnyaLabel, semesterProdiLabel } from './semesterProdi';

describe('semesterProdiLabel', () => {
  it('joins jenis, tahun, and prodi', () => {
    expect(
      semesterProdiLabel({
        semester: { tahun: 2024, jenisSemester: { nama: 'Ganjil' } },
        programStudi: { nama_singkat: 'SI' },
      })
    ).toBe('Ganjil 2024/2025 · SI');
  });

  it('returns dash when empty', () => {
    expect(semesterProdiLabel(null)).toBe('—');
  });
});

describe('semesterDanSebelumnyaLabel', () => {
  it('appends dan sebelumnya', () => {
    expect(
      semesterDanSebelumnyaLabel({ tahun: 2026, jenisSemester: { nama: 'Genap' } })
    ).toBe('Genap 2026/2027 dan sebelumnya');
  });
});
