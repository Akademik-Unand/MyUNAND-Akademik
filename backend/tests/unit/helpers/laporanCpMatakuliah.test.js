'use strict';

const {
  buildCpmkRows,
  buildEvaluasi,
  buildNilaiPeserta,
} = require('../../../src/helpers/laporanCpMatakuliah');

const cpmkRaw = [
  {
    cpmk_id: 'c1',
    nama_cpmk: 'CPMK-1',
    deskripsi: 'Menurunkan konsep metode numerik',
    target_persen: 60,
    nilai_min: 55,
    nama_cp: 'CP-A',
    nama_scp: 'PI-1',
    scp_deskripsi: 'An ability to apply Linear Algebra',
    sumber_id: 's1',
    nama_sumber_penilaian: 'Tugas',
    bobot: 5,
  },
  {
    cpmk_id: 'c1',
    nama_cpmk: 'CPMK-1',
    deskripsi: 'Menurunkan konsep metode numerik',
    target_persen: 60,
    nilai_min: 55,
    nama_cp: 'CP-A',
    nama_scp: 'PI-1',
    scp_deskripsi: 'An ability to apply Linear Algebra',
    sumber_id: 's2',
    nama_sumber_penilaian: 'UTS',
    bobot: 10,
  },
  {
    cpmk_id: 'c2',
    nama_cpmk: 'CPMK-2',
    deskripsi: 'Mengembangkan pemrograman komputasional',
    target_persen: 60,
    nilai_min: 55,
    nama_cp: 'CP-G',
    nama_scp: 'PI-3',
    scp_deskripsi: 'An ability to use engineering softwares',
    sumber_id: 's3',
    nama_sumber_penilaian: 'Quiz',
    bobot: 20,
  },
];

const nilaiRaw = [
  { krs_detil_id: 'kd1', mahasiswa_id: 'm1', niu: '2011', mahasiswa_nama: 'Andi', angkatan: 2020, kelas_nama: 'A', cpmk_id: 'c1', cpmk_nama: 'CPMK-1', nilai_min: 55, sumber_id: 's1', sumber_nama: 'Tugas', bobot: 5, nilai: 80 },
  { krs_detil_id: 'kd1', mahasiswa_id: 'm1', niu: '2011', mahasiswa_nama: 'Andi', angkatan: 2020, kelas_nama: 'A', cpmk_id: 'c1', cpmk_nama: 'CPMK-1', nilai_min: 55, sumber_id: 's2', sumber_nama: 'UTS', bobot: 10, nilai: 40 },
  { krs_detil_id: 'kd1', mahasiswa_id: 'm1', niu: '2011', mahasiswa_nama: 'Andi', angkatan: 2020, kelas_nama: 'A', cpmk_id: 'c2', cpmk_nama: 'CPMK-2', nilai_min: 55, sumber_id: 's3', sumber_nama: 'Quiz', bobot: 20, nilai: 90 },
  { krs_detil_id: 'kd2', mahasiswa_id: 'm2', niu: '2012', mahasiswa_nama: 'Budi', angkatan: 2020, kelas_nama: 'A', cpmk_id: 'c1', cpmk_nama: 'CPMK-1', nilai_min: 55, sumber_id: 's1', sumber_nama: 'Tugas', bobot: 5, nilai: 70 },
  { krs_detil_id: 'kd2', mahasiswa_id: 'm2', niu: '2012', mahasiswa_nama: 'Budi', angkatan: 2020, kelas_nama: 'A', cpmk_id: 'c1', cpmk_nama: 'CPMK-1', nilai_min: 55, sumber_id: 's2', sumber_nama: 'UTS', bobot: 10, nilai: 60 },
  { krs_detil_id: 'kd2', mahasiswa_id: 'm2', niu: '2012', mahasiswa_nama: 'Budi', angkatan: 2020, kelas_nama: 'A', cpmk_id: 'c2', cpmk_nama: 'CPMK-2', nilai_min: 55, sumber_id: 's3', sumber_nama: 'Quiz', bobot: 20, nilai: null },
];

describe('laporanCpMatakuliah', () => {
  it('groups CPMK rows, dedupes CPL and sumber, sums bobot', () => {
    const rows = buildCpmkRows(cpmkRaw);
    expect(rows).toHaveLength(2);
    const c1 = rows.find((row) => row.id === 'c1');
    expect(c1.cpl).toEqual([{ kode: 'CP-A PI-1', deskripsi: 'An ability to apply Linear Algebra' }]);
    expect(c1.sumber.map((item) => item.nama)).toEqual(['Tugas', 'UTS']);
    expect(c1.bobot_total).toBe(15);
    expect(c1.target_persen).toBe(60);
    expect(c1.nilai_min).toBe(55);
  });

  it('picks the strictest target when a CPMK has several SCPs', () => {
    const rows = buildCpmkRows([
      { cpmk_id: 'c1', nama_cpmk: 'CPMK-1', target_persen: 60, nilai_min: 55, nama_cp: 'CP-A', nama_scp: 'PI-1' },
      { cpmk_id: 'c1', nama_cpmk: 'CPMK-1', target_persen: 70, nilai_min: 65, nama_cp: 'CP-G', nama_scp: 'PI-3' },
    ]);
    expect(rows[0].target_persen).toBe(70);
    expect(rows[0].nilai_min).toBe(65);
  });

  it('folds sub-CPMKs under their parent with combined CPL and sumber', () => {
    const rows = buildCpmkRows([
      { cpmk_id: 'root', parent_cpmk_id: null, nama_cpmk: 'CPMK-2', deskripsi: 'Induk' },
      {
        cpmk_id: 'sub1', parent_cpmk_id: 'root', nama_cpmk: 'Sub 1', target_persen: 60, nilai_min: 55,
        nama_cp: 'CP-A', nama_scp: 'PI-2', scp_deskripsi: 'Numerik',
        sumber_id: 's4', nama_sumber_penilaian: 'Tugas', bobot: 5,
      },
      {
        cpmk_id: 'sub1', parent_cpmk_id: 'root', nama_cpmk: 'Sub 1', target_persen: 60, nilai_min: 55,
        nama_cp: 'CP-A', nama_scp: 'PI-2', scp_deskripsi: 'Numerik',
        sumber_id: 's5', nama_sumber_penilaian: 'UTS', bobot: 10,
      },
      {
        cpmk_id: 'sub2', parent_cpmk_id: 'root', nama_cpmk: 'Sub 2', target_persen: 60, nilai_min: 55,
        nama_cp: 'CP-G', nama_scp: 'PI-3', scp_deskripsi: 'Softwares',
        sumber_id: 's6', nama_sumber_penilaian: 'Tugas', bobot: 5,
      },
    ]);
    expect(rows).toHaveLength(1);
    const root = rows[0];
    expect(root.id).toBe('root');
    expect(root.nama_cpmk).toBe('CPMK-2');
    expect(root.cpl.map((item) => item.kode)).toEqual(['CP-A PI-2', 'CP-G PI-3']);
    expect(root.sumber.map((item) => item.nama)).toEqual(['Tugas', 'UTS', 'Tugas']);
    expect(root.bobot_total).toBe(20);
  });

  it('computes weighted skor, nilai masuk, jumlah lulus and capaian per CPMK', () => {
    const cpmk = buildCpmkRows(cpmkRaw);
    const evaluasi = buildEvaluasi(nilaiRaw, cpmk);
    const c1 = evaluasi.find((row) => row.cpmk_id === 'c1');
    // Andi: (80*5 + 40*10)/15 = 53.33 → di bawah 55. Budi: (70*5 + 60*10)/15 = 63.33 → lulus.
    expect(c1.capaian_persen).toBe(50);
    expect(c1.rata_rata).toBe(58.33);
    expect(c1.nilai_masuk).toBe(2);
    expect(c1.jumlah_peserta).toBe(2);
    expect(c1.jumlah_lulus).toBe(1);
    expect(c1.cpl).toEqual(['CP-A PI-1']);
    expect(c1.target_persen_lulus).toBe(60);
    expect(c1.target_nilai_min).toBe(55);
    const c2 = evaluasi.find((row) => row.cpmk_id === 'c2');
    // Hanya Andi yang punya nilai; Budi tanpa nilai tidak lulus.
    expect(c2.nilai_masuk).toBe(1);
    expect(c2.jumlah_lulus).toBe(1);
    expect(c2.capaian_persen).toBe(50);
    expect(c2.rata_rata).toBe(90);
  });

  it('builds the participant grade matrix grouped per CPMK/CPL with portal letter bands', () => {
    const { groups, columns, rows } = buildNilaiPeserta(nilaiRaw, cpmkRaw);
    expect(groups.map((group) => group.nama)).toEqual(['CPMK-1', 'CPMK-2']);
    expect(groups[0].sub[0].nama).toBe('CP-A PI-1');
    expect(groups[0].sub[0].sumber.map((item) => item.nama)).toEqual(['Tugas', 'UTS']);
    expect(groups[1].sub[0].sumber.map((item) => item.nama)).toEqual(['Quiz']);
    expect(columns.map((item) => item.nama)).toEqual(['Tugas', 'UTS', 'Quiz']);
    expect(rows).toHaveLength(2);
    const andi = rows.find((row) => row.niu === '2011');
    // (80*5 + 40*10 + 90*20) / 100
    expect(andi.nilai_angka).toBe(26);
    expect(andi.nilai_huruf).toBe('E');
    const budi = rows.find((row) => row.niu === '2012');
    // (70*5 + 60*10) / 100 — Quiz belum dinilai, ikut dihitung bobotnya.
    expect(budi.nilai_angka).toBe(9.5);
    expect(budi.nilai_huruf).toBe('E');
  });

  it('groups nilai columns by sub-CPMK under a parent CPMK', () => {
    const { groups } = buildNilaiPeserta(
      [
        { krs_detil_id: 'kd4', mahasiswa_id: 'm4', niu: '2014', mahasiswa_nama: 'Dewi', kelas_nama: 'A', cpmk_id: 'sub1', sumber_id: 's4', sumber_nama: 'Tugas', bobot: 5, nilai: 80 },
        { krs_detil_id: 'kd4', mahasiswa_id: 'm4', niu: '2014', mahasiswa_nama: 'Dewi', kelas_nama: 'A', cpmk_id: 'sub2', sumber_id: 's6', sumber_nama: 'Tugas', bobot: 5, nilai: 90 },
      ],
      [
        { cpmk_id: 'root', parent_cpmk_id: null, nama_cpmk: 'CPMK-2' },
        { cpmk_id: 'sub1', parent_cpmk_id: 'root', nama_cpmk: 'Sub 1', nama_cp: 'CP-A', nama_scp: 'PI-2', sumber_id: 's4', nama_sumber_penilaian: 'Tugas', bobot: 5 },
        { cpmk_id: 'sub2', parent_cpmk_id: 'root', nama_cpmk: 'Sub 2', nama_cp: 'CP-G', nama_scp: 'PI-3', sumber_id: 's6', nama_sumber_penilaian: 'Tugas', bobot: 5 },
      ]
    );
    expect(groups).toHaveLength(1);
    expect(groups[0].nama).toBe('CPMK-2');
    expect(groups[0].sub.map((sub) => sub.nama)).toEqual(['CP-A PI-2', 'CP-G PI-3']);
    expect(groups[0].sub[0].sumber.map((item) => item.nama)).toEqual(['Tugas']);
    expect(groups[0].sub[1].sumber.map((item) => item.nama)).toEqual(['Tugas']);
  });
});