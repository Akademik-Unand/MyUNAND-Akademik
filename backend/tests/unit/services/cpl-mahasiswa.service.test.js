'use strict';

jest.mock('../../../src/models', () => ({
  sequelize: { query: jest.fn(), QueryTypes: { SELECT: 'SELECT' } },
  Mahasiswa: { findByPk: jest.fn() },
  ProgramStudi: {},
  Fakultas: {},
  Kurikulum: { findOne: jest.fn() },
  Cp: { findAll: jest.fn() },
}));

const { sequelize, Mahasiswa, Kurikulum, Cp } = require('../../../src/models');
const service = require('../../../src/services/obe/cpl-mahasiswa.service');

describe('cpl-mahasiswa.service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('uses the cohort curriculum and builds a traceable weighted outcome from historical approved grades', async () => {
    Mahasiswa.findByPk.mockResolvedValue({
      id: 'mhs-1', niu: '24123', nama: 'Mahasiswa', angkatan: 2024, program_studi_id: 'prodi-1',
      programStudi: { nama_resmi: 'Sistem Informasi', fakultas: { nama_resmi: 'Teknik' } },
    });
    Kurikulum.findOne.mockResolvedValue({ id: 'kur-2024', tahun: 2024, nama: 'OBE 2024' });
    Cp.findAll.mockResolvedValue([
      { id: 'cp-1', nama_cp: 'CPL-01', deskripsi: 'Mampu menganalisis', nilai_min: 60, toJSON() { return { id: this.id, nama_cp: this.nama_cp, deskripsi: this.deskripsi, nilai_min: this.nilai_min }; } },
      { id: 'cp-2', nama_cp: 'CPL-02', deskripsi: null, nilai_min: 60, toJSON() { return { id: this.id, nama_cp: this.nama_cp, deskripsi: this.deskripsi, nilai_min: this.nilai_min }; } },
    ]);
    sequelize.query.mockResolvedValue([
      { krs_detil_id: 'kd-1', matakuliah_id: 'mk-1', kode_matakuliah: 'SI100', matakuliah_nama: 'Dasar SI', semester_tahun: 2024, root_cpmk_id: 'c1', root_cpmk_nama: 'CPMK-01', cpmk_id: 'c1', nama_cpmk: 'CPMK-01', sumber_id: 's1', nama_sumber_penilaian: 'Tugas', bobot: 40, nilai: 80, cp_id: 'cp-1', nama_scp: 'SCP-01' },
      { krs_detil_id: 'kd-1', matakuliah_id: 'mk-1', kode_matakuliah: 'SI100', matakuliah_nama: 'Dasar SI', semester_tahun: 2024, root_cpmk_id: 'c1', root_cpmk_nama: 'CPMK-01', cpmk_id: 'c1', nama_cpmk: 'CPMK-01', sumber_id: 's2', nama_sumber_penilaian: 'UTS', bobot: 60, nilai: 70, cp_id: 'cp-1', nama_scp: 'SCP-01' },
    ]);

    const result = await service.calculateForMahasiswa('mhs-1');

    expect(Kurikulum.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { program_studi_id: 'prodi-1', tahun: expect.any(Object) } }));
    expect(sequelize.query).toHaveBeenCalledWith(expect.stringContaining("kd.approved = '2'"), expect.objectContaining({ replacements: { mahasiswaId: 'mhs-1', kurikulumId: 'kur-2024' } }));
    expect(result.cpl[0].nilai).toBe(74);
    expect(result.cpl[0].contributors[0].components).toEqual([
      { id: 's1', nama: 'Tugas', bobot: 40, nilai: 80 },
      { id: 's2', nama: 'UTS', bobot: 60, nilai: 70 },
    ]);
    expect(result.cpl[1].nilai).toBeNull();
    expect(result.capaian_keseluruhan).toBe(74);
  });
});
