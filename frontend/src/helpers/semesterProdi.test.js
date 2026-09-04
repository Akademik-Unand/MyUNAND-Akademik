import { describe, expect, it } from 'vitest';
import { semesterProdiLabel } from './semesterProdi';

describe('semesterProdiLabel', () => {
  it('joins jenis, tahun, and prodi', () => {
    expect(
      semesterProdiLabel({
        semester: { tahun: 2024, jenisSemester: { nama: 'Ganjil' } },
        programStudi: { nama_singkat: 'SI' },
      })
    ).toBe('Ganjil 2024 · SI');
  });

  it('returns dash when empty', () => {
    expect(semesterProdiLabel(null)).toBe('—');
  });
});
