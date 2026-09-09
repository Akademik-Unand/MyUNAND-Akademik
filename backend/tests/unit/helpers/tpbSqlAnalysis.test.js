'use strict';

const { normalizeCode, semesterYear, analyzeTpbTables } = require('../../../src/helpers/tpbSqlAnalysis');

describe('TPB SQL dry-run analysis', () => {
  test('normalizes course codes and applies Genap second-year policy', () => {
    expect(normalizeCode(' pa-101 ')).toBe('PA101');
    expect(semesterYear('2024/2025', 'Ganjil')).toBe(2024);
    expect(semesterYear('2024/2025', 'Genap')).toBe(2025);
  });

  test('detects source integrity and target-key risks', () => {
    const tables = {
      tahun_ajaran: [{ id: 1, tahun: '2024/2025', periode: 'Genap' }],
      mata_kuliah: [{ id: 10, kodeMatkul: 'PA-1', namaMatkul: 'A', kurikulum: 2024 }, { id: 11, kodeMatkul: 'pa 1', namaMatkul: 'B', kurikulum: 2025 }],
      tahun_ajaran_matkul: [{ id: 20, tahunAjaranId: 1, mataKuliahId: 10 }, { id: 21, tahunAjaranId: 1, mataKuliahId: 11 }],
      cpmk: [{ id: 30 }, { id: 31 }],
      cpmk_mat_kul: [{ id: 1, cpmkId: 30, tahunAjaranMatkulId: 20 }, { id: 2, cpmkId: 30, tahunAjaranMatkulId: 21 }],
      cpmk_parents: [{ id: 1, child_cpmk_id: 31 }, { id: 2, child_cpmk_id: 31 }],
      mahasiswa: [{ id: 40, nim: '123' }, { id: 41, nim: '123' }, { id: 42, nim: 'ABC' }],
      dosen: [{ id: 50, nip: '12-X' }],
      kelas: [{ id: 60, tahunAjaranMatkulId: 20 }],
      dosen_pengampu_kelas: [{ id: 70, kelasId: 60 }],
      kelas_mahasiswa: [{ id: 80, mahasiswaId: 40, kelasId: 60, totalNilai: 80, grade: 'A' }],
      bobot: [{ id: 90, bobot: 50, tahunAjaranMatkulId: 20, komponenId: 1, cpmkId: 30 }],
      nilai: [{ id: 100, mahasiswaId: 40, dosenPengampuKelasId: 70, tahunAjaranMatkulId: 20, cpmkId: 30, bobotId: 90, nilai: 100 }, { id: 101, mahasiswaId: 40, dosenPengampuKelasId: 70, tahunAjaranMatkulId: 20, cpmkId: 30, bobotId: 90, nilai: 80 }],
    };
    const report = analyzeTpbTables(tables);
    expect(report.academicPeriods[0].calendarYear).toBe(2025);
    expect(report.courseVariants).toHaveLength(1);
    expect(report.duplicateNims).toHaveLength(1);
    expect(report.invalidNims).toHaveLength(1);
    expect(report.invalidNips).toHaveLength(1);
    expect(report.cpmkMultipleCourseLinks).toHaveLength(1);
    expect(report.cpmkMissingCourseLinks).toEqual([{ cpmkId: 31, courseIds: [] }]);
    expect(report.multiParentCpmkChildren).toHaveLength(1);
    expect(report.weightTotals.not100).toHaveLength(1);
    expect(report.duplicateTargetScoreKeys).toHaveLength(1);
    expect(report.finalReconciliation.totalMismatches).toHaveLength(1);
  });
});
