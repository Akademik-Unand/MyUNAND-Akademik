export const FAKULTAS = [
  { kode: 'FT', universitas: 'Universitas Andalas', nama: 'Fakultas Teknik', singkat: 'FT' },
  { kode: 'FEB', universitas: 'Universitas Andalas', nama: 'Fakultas Ekonomi dan Bisnis', singkat: 'FEB' },
  { kode: 'FMIPA', universitas: 'Universitas Andalas', nama: 'Fakultas Matematika dan Ilmu Pengetahuan Alam', singkat: 'FMIPA' },
  { kode: 'FH', universitas: 'Universitas Andalas', nama: 'Fakultas Hukum', singkat: 'FH' },
  { kode: 'FP', universitas: 'Universitas Andalas', nama: 'Fakultas Pertanian', singkat: 'FP' },
];

export const DEPARTEMEN = [
  { kode: 'DPT001', fakultas: 'Fakultas Teknik', nama: 'Teknik Informatika', singkat: 'TI' },
  { kode: 'DPT002', fakultas: 'Fakultas Teknik', nama: 'Teknik Elektro', singkat: 'TE' },
  { kode: 'DPT003', fakultas: 'Fakultas Teknik', nama: 'Teknik Sipil', singkat: 'TS' },
  { kode: 'DPT004', fakultas: 'Fakultas Teknik', nama: 'Teknik Mesin', singkat: 'TM' },
  { kode: 'DPT005', fakultas: 'Fakultas Ekonomi', nama: 'Manajemen', singkat: 'MNJ' },
];

export const PRODI = [
  { kode: 'PROD001', jenjang: 'S1', model: 101, univ: 10, fakultas: 1, departemen: 21, nama: 'Teknik Informatika', singkat: 'TI' },
  { kode: 'PROD002', jenjang: 'S1', model: 102, univ: 10, fakultas: 1, departemen: 22, nama: 'Teknik Elektro', singkat: 'TE' },
  { kode: 'PROD003', jenjang: 'S1', model: 103, univ: 10, fakultas: 2, departemen: 23, nama: 'Teknik Sipil', singkat: 'TS' },
  { kode: 'PROD004', jenjang: 'S2', model: 104, univ: 11, fakultas: 2, departemen: 24, nama: 'Teknik Mesin', singkat: 'TM' },
  { kode: 'PROD005', jenjang: 'S2', model: 105, univ: 11, fakultas: 3, departemen: 25, nama: 'Manajemen', singkat: 'MNJ' },
];

export const JENJANG_AKADEMIK = [
  { kode: 'S1', nama: 'Strata 1 (Sarjana)' },
  { kode: 'D3', nama: 'Diploma 3' },
  { kode: 'S2', nama: 'Magister (Strata 2)' },
];

export const JENIS_SEMESTER = [
  { no: 1, kategori: 'Reguler', periode: 'Semester I', label: 'Ganjil', singkat: 'Smt-I' },
  { no: 2, kategori: 'Reguler', periode: 'Semester I', label: 'Pendek', singkat: 'SP' },
  { no: 3, kategori: 'Reguler', periode: 'Semester II', label: 'Genap', singkat: 'Smt-II' },
  { no: 4, kategori: 'Reguler', periode: 'Semester II', label: 'KKN', singkat: 'KKN' },
];

export const SETTING_SEMESTER = [
  { id: 'ss1', tahun: '2024/2025', semester: 'Genap', status: 'Aktif', periodeMulai: '2025-01-13', periodeSelesai: '2025-06-28', rencanaMulai: '2025-01-06', rencanaSelesai: '2025-01-17', ubahMulai: '2025-01-20', ubahSelesai: '2025-01-24', nilaiMulai: '2025-06-16', nilaiSelesai: '2025-07-12' },
  { id: 'ss2', tahun: '2024/2025', semester: 'Ganjil', status: 'Tidak Aktif', periodeMulai: '2024-08-19', periodeSelesai: '2024-12-21', rencanaMulai: '2024-08-05', rencanaSelesai: '2024-08-16', ubahMulai: '2024-08-19', ubahSelesai: '2024-08-23', nilaiMulai: '2024-12-09', nilaiSelesai: '2025-01-04' },
  { id: 'ss3', tahun: '2023/2024', semester: 'Pendek', status: 'Tidak Aktif', periodeMulai: '2024-06-10', periodeSelesai: '2024-08-02', rencanaMulai: '2024-06-03', rencanaSelesai: '2024-06-07', ubahMulai: '2024-06-10', ubahSelesai: '2024-06-12', nilaiMulai: '2024-07-29', nilaiSelesai: '2024-08-09' },
  { id: 'ss4', tahun: '2023/2024', semester: 'Genap', status: 'Tidak Aktif', periodeMulai: '2024-01-15', periodeSelesai: '2024-06-22', rencanaMulai: '2024-01-08', rencanaSelesai: '2024-01-19', ubahMulai: '2024-01-22', ubahSelesai: '2024-01-26', nilaiMulai: '2024-06-10', nilaiSelesai: '2024-07-05' },
  { id: 'ss5', tahun: '2023/2024', semester: 'Ganjil', status: 'Tidak Aktif', periodeMulai: '2023-08-21', periodeSelesai: '2023-12-22', rencanaMulai: '2023-08-07', rencanaSelesai: '2023-08-18', ubahMulai: '2023-08-21', ubahSelesai: '2023-08-25', nilaiMulai: '2023-12-11', nilaiSelesai: '2024-01-05' },
  { id: 'ss6', tahun: '2022/2023', semester: 'Pendek', status: 'Tidak Aktif', periodeMulai: '2023-06-12', periodeSelesai: '2023-08-04', rencanaMulai: '2023-06-05', rencanaSelesai: '2023-06-09', ubahMulai: '2023-06-12', ubahSelesai: '2023-06-14', nilaiMulai: '2023-07-31', nilaiSelesai: '2023-08-11' },
  { id: 'ss7', tahun: '2022/2023', semester: 'Genap', status: 'Tidak Aktif', periodeMulai: '2023-01-16', periodeSelesai: '2023-06-24', rencanaMulai: '2023-01-09', rencanaSelesai: '2023-01-20', ubahMulai: '2023-01-23', ubahSelesai: '2023-01-27', nilaiMulai: '2023-06-12', nilaiSelesai: '2023-07-07' },
  { id: 'ss8', tahun: '2022/2023', semester: 'Ganjil', status: 'Tidak Aktif', periodeMulai: '2022-08-22', periodeSelesai: '2022-12-23', rencanaMulai: '2022-08-08', rencanaSelesai: '2022-08-19', ubahMulai: '2022-08-22', ubahSelesai: '2022-08-26', nilaiMulai: '2022-12-12', nilaiSelesai: '2023-01-06' },
];

export const PROGRAM_STUDI_OPTIONS = [
  'Teknik Elektro - S1 Reguler',
  'Teknik Elektro - S1 Mandiri',
  'Teknik Elektro - S2 Reguler',
  'Teknik Mesin - S1 Reguler',
  'Teknik Mesin - S1 Mandiri',
  'Teknik Mesin - S2 Reguler',
  'Teknik Sipil - S1 Reguler',
  'Teknik Sipil - S1 Mandiri',
  'Teknik Sipil - S2 Reguler',
  'Teknik Sipil - S3 Reguler',
  'Teknik Lingkungan - S1 Reguler',
  'Teknik Lingkungan - S1 Mandiri',
  'Teknik Lingkungan - S2 Reguler',
  'Teknik Industri - S1 Reguler',
  'Teknik Industri - S1 Mandiri',
  'Teknik Industri - S2 Reguler',
  'Teknik Industri - S3 Reguler',
];

export const FILTER_DEPARTEMEN = [
  'JURUSAN TEKNIK MESIN',
  'JURUSAN TEKNIK ELEKTRO',
  'JURUSAN TEKNIK SIPIL',
  'JURUSAN TEKNIK INDUSTRI',
  'JURUSAN TEKNIK LINGKUNGAN',
  'JURUSAN TEKNIK INFORMATIKA',
  'JURUSAN ARSITEKTUR',
  'DEPARTEMEN MANAJEMEN',
  'DEPARTEMEN AKUNTANSI',
  'DEPARTEMEN EKONOMI',
  'DEPARTEMEN ILMU HUKUM',
  'DEPARTEMEN AGRONOMI',
  'DEPARTEMEN PROTEKSI TANAMAN',
  'DEPARTEMEN ILMU TANAH',
  'DEPARTEMEN MATEMATIKA',
  'DEPARTEMEN FISIKA',
  'DEPARTEMEN KIMIA',
  'DEPARTEMEN BIOLOGI',
  'DEPARTEMEN STATISTIKA',
  'DEPARTEMEN FARMASI',
  'DEPARTEMEN KEPERAWATAN',
  'DEPARTEMEN GIZI',
  'DEPARTEMEN ILMU KOMUNIKASI',
  'DEPARTEMEN SOSIOLOGI',
  'DEPARTEMEN ANTROPOLOGI',
];

export const FILTER_PRODI = ['S1', 'S2', 'S3', 'D3', 'Profesi'];

export const FILTER_KURIKULUM = [
  'Kurikulum JTM-S1-2021-2026',
  'Kurikulum JTM-S1-2016-2021',
  'Kurikulum JTE-S1-2021-2026',
  'Kurikulum JTE-S2-2020-2025',
  'Kurikulum JTS-S1-2021-2026',
  'Kurikulum JTS-S2-2019-2024',
  'Kurikulum JTI-S1-2021-2026',
  'Kurikulum JTL-S1-2022-2027',
  'Kurikulum TI-S1-2023-2028',
  'Kurikulum MNJ-S1-2020-2025',
];

export const FILTER_SEMESTER = [
  'Genap 2024',
  'Ganjil 2024',
  'Pendek 2024',
  'Genap 2025',
  'Ganjil 2025',
  'Pendek 2025',
  'Genap 2023',
  'Ganjil 2023',
  'Pendek 2023',
  'Genap 2022',
  'Ganjil 2022',
  'Pendek 2022',
  'Genap 2021',
  'Ganjil 2021',
];

const scpRow = {
  target: '60%',
  nilaiMinimal: '55 dari skala 100',
};

export const KURIKULUM_CP = [
  {
    kode: 'SO A',
    deskripsi: 'An ability to apply knowledge of mathematics, science, and engineering in mechanical engineering problems.',
    targetAktif: true,
    scp: [
      { kode: 'PI 1', deskripsi: 'An ability to apply knowledge of Linear Algebra and Calculus', ...scpRow },
      { kode: 'PI 2', deskripsi: 'An ability to apply basic mechanics and materials science', ...scpRow },
      { kode: 'PI 3', deskripsi: 'An ability to apply thermodynamics and fluid mechanics principles', ...scpRow },
      { kode: 'PI 4', deskripsi: 'An ability to model and analyze engineering systems', ...scpRow },
      { kode: 'PI 5', deskripsi: 'An ability to use computational tools for engineering problems', ...scpRow },
    ],
  },
  {
    kode: 'SO B',
    deskripsi: 'An ability to design and conduct experiments, as well as to analyze and interpret data.',
    targetAktif: false,
    scp: [
      { kode: 'PI 1', deskripsi: 'An ability to formulate experimental procedures', ...scpRow },
      { kode: 'PI 2', deskripsi: 'An ability to analyze and interpret experimental data', ...scpRow },
      { kode: 'PI 3', deskripsi: 'An ability to report experimental results clearly', ...scpRow },
    ],
  },
  {
    kode: 'SO C',
    deskripsi: 'An ability to design a system, component, or process to meet desired needs within realistic constraints.',
    targetAktif: false,
    scp: [
      { kode: 'PI 1', deskripsi: 'An ability to define design requirements and constraints', ...scpRow },
      { kode: 'PI 2', deskripsi: 'An ability to generate and evaluate design alternatives', ...scpRow },
    ],
  },
];

export const CPMK_KURIKULUM = [
  { kode: 'TMS 62280', sks: 2, nama: 'Aero dan Hidro Modelling', jumlahCpmk: 3 },
  { kode: 'MWU60101', sks: 2, nama: 'Agama', jumlahCpmk: 3 },
  { kode: 'AND60227', sks: 2, nama: 'Analisis Data Eksperimental/observasi/survey', jumlahCpmk: 2 },
  { kode: 'TMS 62277', sks: 2, nama: 'Analisis Kegagalan dan Perawatan Mesin', jumlahCpmk: 6 },
  { kode: 'AND60228', sks: 6, nama: 'Asistensi Riset', jumlahCpmk: 3 },
  { kode: 'MWU60104', sks: 2, nama: 'Bahasa Indonesia', jumlahCpmk: 6 },
  { kode: 'TEK 60101', sks: 2, nama: 'Bahasa Inggris', jumlahCpmk: 7 },
  { kode: 'TMS 61268', sks: 2, nama: 'CNC Programming', jumlahCpmk: 4 },
  { kode: 'TMS 61271', sks: 2, nama: 'Desain Perkakas dan Cetakan', jumlahCpmk: 4 },
  { kode: 'TMS 62144', sks: 3, nama: 'Desain Sistem Termal', jumlahCpmk: 4 },
  { kode: 'TMS62125', sks: 2, nama: 'Dinamika Partikel', jumlahCpmk: 4 },
  { kode: 'TMS 62289', sks: 2, nama: 'Dinamika Struktur (Metode Numerik dan Instrumentasi)', jumlahCpmk: 4 },
  { kode: 'TEK 60103', sks: 2, nama: 'Ekonomi Teknik', jumlahCpmk: 4 },
  { kode: 'TMS 62143', sks: 2, nama: 'Elemen Mesin 2', jumlahCpmk: 3 },
];

export const MK_SEMESTER = [
  { kode: 'TMS 62280', nama: 'Aero dan Hidro Modelling', sks: 2, kelas: 1, peserta: 6, transkrip: 'Tidak', jumlahCpmk: 3, prodi: 'S1 Teknik Mesin', kurikulum: 'Kurikulum JTM-S1-2021-2026', semester: 'Genap 2024', kelasKode: 'TMS 62280 TM', dosen: 'DENDI ADI SAPUTRA' },
  { kode: 'AND60227', nama: 'Analisis Data Eksperimental/observasi/survey', sks: 2, kelas: 1, peserta: 1, transkrip: 'Tidak', jumlahCpmk: 2, prodi: 'S1 Teknik Mesin', kurikulum: 'Kurikulum JTM-S1-2021-2026', semester: 'Genap 2024', kelasKode: 'AND60227 TM', dosen: 'DEVI CHANDRA' },
  { kode: 'TMS 62277', nama: 'Analisis Kegagalan dan Perawatan Mesin', sks: 2, kelas: 1, peserta: 3, transkrip: 'Tidak', jumlahCpmk: 6, prodi: 'S1 Teknik Mesin', kurikulum: 'Kurikulum JTM-S1-2021-2026', semester: 'Genap 2024', kelasKode: 'TMS 62277 TM', dosen: 'ILHAMDI' },
  { kode: 'AND60228', nama: 'Asistensi Riset', sks: 6, kelas: 1, peserta: 1, transkrip: 'Tidak', jumlahCpmk: 3, prodi: 'S1 Teknik Mesin', kurikulum: 'Kurikulum JTM-S1-2021-2026', semester: 'Genap 2024', kelasKode: 'AND60228 TM', dosen: 'DEVI CHANDRA' },
  { kode: 'TEK 60101', nama: 'Bahasa Inggris', sks: 2, kelas: 4, peserta: 144, transkrip: 'Ya', jumlahCpmk: 6, prodi: 'S1 Teknik Mesin', kurikulum: 'Kurikulum JTM-S1-2021-2026', semester: 'Genap 2024', kelasKode: 'TEK 60101 TM A', dosen: 'TIM BAHASA' },
  { kode: 'TMS 62144', nama: 'Desain Sistem Termal', sks: 3, kelas: 6, peserta: 144, transkrip: 'Ya', jumlahCpmk: 4, prodi: 'S1 Teknik Mesin', kurikulum: 'Kurikulum JTM-S1-2021-2026', semester: 'Genap 2024', kelasKode: 'TMS 62144 TM A', dosen: 'ILHAMDI' },
  { kode: 'TMS62125', nama: 'Dinamika Partikel', sks: 2, kelas: 5, peserta: 226, transkrip: 'Tidak', jumlahCpmk: 4, prodi: 'S1 Teknik Mesin', kurikulum: 'Kurikulum JTM-S1-2021-2026', semester: 'Genap 2024', kelasKode: 'TMS62125 TM A', dosen: 'DENDI ADI SAPUTRA' },
  { kode: 'TMS 62289', nama: 'Dinamika Struktur (Metode Numerik dan Instrumentasi)', sks: 2, kelas: 1, peserta: 8, transkrip: 'Tidak', jumlahCpmk: 4, prodi: 'S1 Teknik Mesin', kurikulum: 'Kurikulum JTM-S1-2021-2026', semester: 'Genap 2024', kelasKode: 'TMS 62289 TM', dosen: 'DEVI CHANDRA' },
  { kode: 'TEK 60103', nama: 'Ekonomi Teknik', sks: 2, kelas: 5, peserta: 161, transkrip: 'Ya', jumlahCpmk: 4, prodi: 'S1 Teknik Mesin', kurikulum: 'Kurikulum JTM-S1-2021-2026', semester: 'Genap 2024', kelasKode: 'TEK 60103 TM A', dosen: 'TIM EKONOMI' },
  { kode: 'TMS 62143', nama: 'Elemen Mesin 2', sks: 2, kelas: 5, peserta: 127, transkrip: 'Ya', jumlahCpmk: 3, prodi: 'S1 Teknik Mesin', kurikulum: 'Kurikulum JTM-S1-2021-2026', semester: 'Genap 2024', kelasKode: 'TMS 62143 TM KBI', dosen: 'ILHAMDI' },
];

export const KELAS = [
  { kode: 'TEK 60103 TM A', mataKuliah: 'Ekonomi Teknik - TEK 60103', sks: 2, prodi: 'S1 Teknik Mesin', semester: 'Genap 2024', peserta: 26 },
  { kode: 'TMS 62141 TM KBI', mataKuliah: 'Perancangan Teknik - TMS 62141', sks: 2, prodi: 'S1 Teknik Mesin', semester: 'Genap 2024', peserta: 12 },
  { kode: 'TMS 62143 TM KBI', mataKuliah: 'Elemen Mesin 2 - TMS 62143', sks: 2, prodi: 'S1 Teknik Mesin', semester: 'Genap 2024', peserta: 12 },
  { kode: 'TMS 60150 TM C', mataKuliah: 'Seminar Proposal Tugas Akhir - TMS 60150', sks: 2, prodi: 'S1 Teknik Mesin', semester: 'Genap 2024', peserta: 18 },
  { kode: 'TMS 62261 TM', mataKuliah: 'Teknik Pengendalian Suara di Industri - TMS 62261', sks: 2, prodi: 'S1 Teknik Mesin', semester: 'Genap 2024', peserta: 16 },
  { kode: 'TMS 512 S2 TM', mataKuliah: 'Getaran Mekanik Terapan - TMS 512', sks: 3, prodi: 'S2 Teknik Mesin', semester: 'Genap 2024', peserta: 1 },
  { kode: 'TMS 615 S2 TM', mataKuliah: 'Pemrosesan Sinyal - TMS 615 TM', sks: 3, prodi: 'S2 Teknik Mesin', semester: 'Genap 2024', peserta: '-' },
  { kode: 'TMS 92104 S3', mataKuliah: 'Kolokium - TMS 92104', sks: 3, prodi: 'S3 Teknik Mesin', semester: 'Genap 2024', peserta: 10 },
  { kode: 'TMS 91238', mataKuliah: 'Monitoring Kesehatan Struktur Melalui Getaran - TMS 91238', sks: 3, prodi: 'S3 Teknik Mesin', semester: 'Genap 2024', peserta: '-' },
];

export const UPLOAD_NILAI = [
  { kelas: 'MVUG0102 TM', mataKuliah: 'Pancasila - MVUG0102', sks: 2, prodi: 'S1 Teknik Mesin', semester: 'Genap 2024', peserta: 145 },
  { kelas: 'MVUG0103 TM', mataKuliah: 'Kewarganegaraan - MVUG0103', sks: 2, prodi: 'S1 Teknik Mesin', semester: 'Genap 2024', peserta: 144 },
  { kelas: 'TMS 60153 TM', mataKuliah: 'Ujian Akhir - TMS 60153', sks: 1, prodi: 'S1 Teknik Mesin', semester: 'Genap 2024', peserta: 158 },
  { kelas: 'AND 60101 TM', mataKuliah: 'KKN - AND 60101', sks: 2, prodi: 'S1 Teknik Mesin', semester: 'Genap 2024', peserta: 32 },
  { kelas: 'TMS 60150 TM A', mataKuliah: 'Seminar Proposal Tugas Akhir - TMS 60150', sks: 2, prodi: 'S1 Teknik Mesin', semester: 'Genap 2024', peserta: 32 },
  { kelas: 'TMS 60151 TM', mataKuliah: 'Kerja Praktek - TMS 60151', sks: 2, prodi: 'S1 Teknik Mesin', semester: 'Genap 2024', peserta: 110 },
  { kelas: 'TMS 60152 TM', mataKuliah: 'Tugas Akhir - TMS 60152', sks: 3, prodi: 'S1 Teknik Mesin', semester: 'Genap 2024', peserta: 163 },
];

export const REKAP_CP_ROWS = [
  { id: 'r1', bp: '2210912030', mahasiswa: 'A. FURQAN', angkatan: 2022, semester: 'Genap 2024', mk: 'Desain Sistem Termal', kelas: 'TMS 62144 TM A', cpmk: 'CPMK-1', cp: 'SO A', scp: 'PI-1', targetMin: 55, targetCapai: '60%', capaianTarget: '72%', statusTercapai: 'Tercapai', sumber: 'UAS', bobot: '15%', nilai: 78, lulus: 'Ya' },
  { id: 'r2', bp: '2210912030', mahasiswa: 'A. FURQAN', angkatan: 2022, semester: 'Genap 2024', mk: 'Desain Sistem Termal', kelas: 'TMS 62144 TM A', cpmk: 'CPMK-2', cp: 'SO A', scp: 'PI-1', targetMin: 55, targetCapai: '60%', capaianTarget: '65%', statusTercapai: 'Tercapai', sumber: 'UTS', bobot: '15%', nilai: 70, lulus: 'Ya' },
  { id: 'r3', bp: '2210912030', mahasiswa: 'A. FURQAN', angkatan: 2022, semester: 'Genap 2024', mk: 'Desain Sistem Termal', kelas: 'TMS 62144 TM A', cpmk: 'CPMK-3', cp: 'SO B', scp: 'PI-1', targetMin: 55, targetCapai: '60%', capaianTarget: '48%', statusTercapai: 'Belum', sumber: 'Presentasi', bobot: '10%', nilai: 52, lulus: 'Tidak' },
  { id: 'r4', bp: '2210913006', mahasiswa: 'AHMAD FAUZI', angkatan: 2022, semester: 'Genap 2024', mk: 'Desain Sistem Termal', kelas: 'TMS 62144 TM A', cpmk: 'CPMK-1', cp: 'SO A', scp: 'PI-5', targetMin: 55, targetCapai: '60%', capaianTarget: '81%', statusTercapai: 'Tercapai', sumber: 'Tugas', bobot: '5%', nilai: 84, lulus: 'Ya' },
  { id: 'r5', bp: '2210913012', mahasiswa: 'SITI RAHMA', angkatan: 2022, semester: 'Genap 2024', mk: 'Elemen Mesin 2', kelas: 'TMS 62143 TM KBI', cpmk: 'CPMK-1', cp: 'SO A', scp: 'PI-2', targetMin: 55, targetCapai: '60%', capaianTarget: '58%', statusTercapai: 'Belum', sumber: 'UTS', bobot: '20%', nilai: 61, lulus: 'Ya' },
];

export const LAPORAN_CP = [
  { id: 'lap1', nama: 'Seminar Proposal Ganjil 2024 2025', keterangan: '', dibuatOleh: 'Ilhamdi', terakhir: '23 April 2025, 09:36', kurikulum: 'Kurikulum JTM-S1-2021-2026', semester: 'Ganjil 2024' },
  { id: 'lap2', nama: 'Laporan CP Ganjil 2023', keterangan: 'khusus ganjil 2023/2024', dibuatOleh: 'Ilhamdi', terakhir: '14 Januari 2025, 10:25', kurikulum: 'Kurikulum JTM-S1-2021-2026', semester: 'Ganjil 2023' },
  { id: 'lap3', nama: 'Lap CP Semester Genap 2022-2023', keterangan: 'Lap CP', dibuatOleh: 'Devi Chandra', terakhir: '29 Februari 2024, 08:59', kurikulum: 'Kurikulum JTM-S1-2021-2026', semester: 'Genap 2023' },
  { id: 'lap4', nama: 'Lap CP Genap 2022-2023', keterangan: 'Lap CP-2', dibuatOleh: 'Devi Chandra', terakhir: '29 Februari 2024, 08:13', kurikulum: 'Kurikulum JTM-S1-2021-2026', semester: 'Genap 2023' },
  { id: 'lap5', nama: 'Laporan CP 1', keterangan: 'Genap 2022', dibuatOleh: 'Devi Chandra', terakhir: '26 Februari 2024, 10:29', kurikulum: 'Kurikulum JTM-S1-2016', semester: 'Genap 2022' },
];

export const KURIKULUM_LIST = [
  { id: 'kur1', nama: 'JTE-S1-2021', tahun: 2021, masaIdeal: 8, masaMaks: 14, skRektor: 'No : 1993/UN16.R/KP', tanggalKeputusan: '2021-08-15', pihak: 'Rektor Universitas Andalas', tanggalDisetujui: '2021-08-20', prodi: 'Teknik Elektro - S1 Reguler' },
  { id: 'kur2', nama: 'JTE-S1-2016', tahun: 2016, masaIdeal: 8, masaMaks: 14, skRektor: 'No : 1420/UN16.R/KP', tanggalKeputusan: '2016-07-12', pihak: 'Rektor Universitas Andalas', tanggalDisetujui: '2016-07-18', prodi: 'Teknik Elektro - S1 Reguler' },
  { id: 'kur3', nama: 'JTE-S1-2010', tahun: 2010, masaIdeal: 8, masaMaks: 14, skRektor: 'No : 0881/UN16.R/KP', tanggalKeputusan: '2010-08-01', pihak: 'Rektor Universitas Andalas', tanggalDisetujui: '2010-08-10', prodi: 'Teknik Elektro - S1 Reguler' },
  { id: 'kur4', nama: '2005', tahun: 2005, masaIdeal: 8, masaMaks: 14, skRektor: 'No : 0550/UN16.R/KP', tanggalKeputusan: '2005-07-20', pihak: 'Rektor Universitas Andalas', tanggalDisetujui: '2005-07-25', prodi: 'Teknik Elektro - S1 Reguler' },
  { id: 'kur5', nama: '2003', tahun: 2003, masaIdeal: 8, masaMaks: 14, skRektor: 'No : 0312/UN16.R/KP', tanggalKeputusan: '2003-08-04', pihak: 'Rektor Universitas Andalas', tanggalDisetujui: '2003-08-11', prodi: 'Teknik Elektro - S1 Reguler' },
  { id: 'kur6', nama: 'JTM-S1-2021', tahun: 2021, masaIdeal: 8, masaMaks: 14, skRektor: 'No : 1994/UN16.R/KP', tanggalKeputusan: '2021-08-15', pihak: 'Rektor Universitas Andalas', tanggalDisetujui: '2021-08-20', prodi: 'Teknik Mesin - S1 Reguler' },
];

export const CPMK_DETAIL = [
  {
    nama: 'CPMK 1',
    deskripsi: 'Mahasiswa dapat menjelaskan konsep-konsep dasar yang terkait dengan aliran fluida, tekanan, gaya aerodinamika, dan hidrodinamika.',
    status: 'Aktif',
    mappings: [
      { cpl: 'SO A', cplDesc: 'An ability to apply knowledge of mathematics, science, and engineering in mechanical engineering problems.', pi: 'PI 3', piDesc: 'An ability to apply thermodynamics and fluid mechanics principles' },
      { cpl: 'SO A', cplDesc: 'An ability to apply knowledge of mathematics, science, and engineering in mechanical engineering problems.', pi: 'PI 4', piDesc: 'An ability to model and analyze engineering systems' },
    ],
  },
  {
    nama: 'CPMK 2',
    deskripsi: 'Mahasiswa mampu merancang model aero dan hidro untuk kasus rekayasa sederhana.',
    status: 'Aktif',
    mappings: [
      { cpl: 'SO C', cplDesc: 'An ability to design a system, component, or process to meet desired needs within realistic constraints.', pi: 'PI 1', piDesc: 'An ability to define design requirements and constraints' },
    ],
  },
  {
    nama: 'CPMK 3',
    deskripsi: 'Mahasiswa mampu menganalisis hasil simulasi aliran dan menuliskannya dalam laporan teknis.',
    status: 'Draft',
    mappings: [
      { cpl: 'SO B', cplDesc: 'An ability to design and conduct experiments, as well as to analyze and interpret data.', pi: 'PI 2', piDesc: 'An ability to analyze and interpret experimental data' },
    ],
  },
];

export const MAPPING_MATRIX = {
  headers: [
    { so: 'SO A', pis: ['PI 1', 'PI 2', 'PI 3', 'PI 4', 'PI 5'] },
    { so: 'SO B', pis: ['PI 1', 'PI 2', 'PI 3'] },
    { so: 'SO C', pis: ['PI 1', 'PI 2'] },
  ],
  rows: [
    {
      kode: 'TMS 62280',
      nama: 'Aero dan Hidro Modelling',
      sks: 2,
      cells: { 'SO A|PI 3': ['CPMK 1'], 'SO A|PI 4': ['CPMK 1'], 'SO C|PI 1': ['CPMK 2'] },
    },
    {
      kode: 'TMS 62277',
      nama: 'Analisis Kegagalan dan Perawatan Mesin',
      sks: 2,
      cells: { 'SO A|PI 3': ['CPMK 2'], 'SO A|PI 4': ['CPMK 1'], 'SO B|PI 2': ['CPMK 3', 'CPMK 4'] },
    },
    {
      kode: 'TMS 62144',
      nama: 'Desain Sistem Termal',
      sks: 3,
      cells: { 'SO A|PI 1': ['CPMK 2'], 'SO A|PI 5': ['CPMK 1'], 'SO C|PI 2': ['CPMK 3'] },
    },
    {
      kode: 'TMS 62143',
      nama: 'Elemen Mesin 2',
      sks: 2,
      cells: { 'SO A|PI 2': ['CPMK 1'], 'SO C|PI 1': ['CPMK 2'] },
    },
  ],
};

export const MK_TRANSKRIP = [
  { kode: 'MWU60101', nama: 'Agama', sks: 2, kelas: 2, peserta: 148, jumlahCpmk: 3, transkrip: 'Ya' },
  { kode: 'MWU60104', nama: 'Bahasa Indonesia', sks: 2, kelas: 2, peserta: 150, jumlahCpmk: 6, transkrip: 'Ya' },
  { kode: 'TEK 60101', nama: 'Bahasa Inggris', sks: 2, kelas: 4, peserta: 144, jumlahCpmk: 6, transkrip: 'Ya' },
  { kode: 'TEK 60103', nama: 'Ekonomi Teknik', sks: 2, kelas: 5, peserta: 161, jumlahCpmk: 4, transkrip: 'Ya' },
  { kode: 'TMS 62144', nama: 'Desain Sistem Termal', sks: 3, kelas: 6, peserta: 144, jumlahCpmk: 4, transkrip: 'Ya' },
  { kode: 'TMS 62143', nama: 'Elemen Mesin 2', sks: 2, kelas: 5, peserta: 127, jumlahCpmk: 3, transkrip: 'Ya' },
  { kode: 'TMS 62280', nama: 'Aero dan Hidro Modelling', sks: 2, kelas: 1, peserta: 6, jumlahCpmk: 3, transkrip: 'Tidak' },
  { kode: 'TMS 62277', nama: 'Analisis Kegagalan dan Perawatan Mesin', sks: 2, kelas: 1, peserta: 3, jumlahCpmk: 6, transkrip: 'Tidak' },
];

export const UPLOAD_HISTORY = [
  { id: 'uh1', kelas: 'MVUG0102 TM', mataKuliah: 'Pancasila', pengunggah: 'Ilhamdi', waktu: '12 Juli 2025, 14:22', status: 'Berhasil', peserta: 145 },
  { id: 'uh2', kelas: 'TMS 60153 TM', mataKuliah: 'Ujian Akhir', pengunggah: 'Devi Chandra', waktu: '11 Juli 2025, 09:10', status: 'Berhasil', peserta: 158 },
  { id: 'uh3', kelas: 'TMS 60150 TM A', mataKuliah: 'Seminar Proposal Tugas Akhir', pengunggah: 'Ilhamdi', waktu: '10 Juli 2025, 16:45', status: 'Revisi', peserta: 32 },
  { id: 'uh4', kelas: 'AND 60101 TM', mataKuliah: 'KKN', pengunggah: 'Admin FT', waktu: '09 Juli 2025, 11:03', status: 'Berhasil', peserta: 32 },
];

export const KELAS_PESERTA = [
  { bp: '2210912030', nama: 'A. FURQAN', angkatan: 2022, status: 'Aktif', nilai: 78 },
  { bp: '2210913006', nama: 'AHMAD FAUZI', angkatan: 2022, status: 'Aktif', nilai: 84 },
  { bp: '2210913012', nama: 'SITI RAHMA', angkatan: 2022, status: 'Aktif', nilai: 61 },
  { bp: '2210913044', nama: 'BUDI SANTOSO', angkatan: 2022, status: 'Aktif', nilai: 73 },
  { bp: '2110912001', nama: 'RINA PUTRI', angkatan: 2021, status: 'Aktif', nilai: 88 },
  { bp: '2110912088', nama: 'FAJAR NUGRAHA', angkatan: 2021, status: 'Cuti', nilai: '-' },
];

export const NILAI_KELAS = [
  { bp: '2210912030', nama: 'A. FURQAN', uts: 80, uas: 76, tugas: 85, akhir: 78 },
  { bp: '2210913006', nama: 'AHMAD FAUZI', uts: 88, uas: 82, tugas: 80, akhir: 84 },
  { bp: '2210913012', nama: 'SITI RAHMA', uts: 60, uas: 58, tugas: 70, akhir: 61 },
  { bp: '2210913044', nama: 'BUDI SANTOSO', uts: 74, uas: 70, tugas: 78, akhir: 73 },
  { bp: '2110912001', nama: 'RINA PUTRI', uts: 90, uas: 86, tugas: 88, akhir: 88 },
];

export const LAPORAN_MATRIX = [
  { cp: 'SO A', scp: 'PI 1', cpmk: 'CPMK-2', mk: 'Desain Sistem Termal – Genap 2024', sumber: 'Presentasi 10%, Tugas 5%, UTS 10%', nilaiMin: 55, target: '60%', checked: true },
  { cp: 'SO A', scp: 'PI 1', cpmk: 'CPMK-3', mk: 'Dinamika Struktur – Genap 2024', sumber: 'Laporan 3%, Presentasi 2%, Tugas 6%', nilaiMin: 65, target: '60%', checked: true },
  { cp: 'SO A', scp: 'PI 1', cpmk: 'CPMK-1', mk: 'Dinamika Struktur – Genap 2024', sumber: 'Laporan 3%, Presentasi 2%, Tugas 4%', nilaiMin: 55, target: '60%', checked: false },
  { cp: 'SO B', scp: 'PI 2', cpmk: 'CPMK-1', mk: 'Analisis Data Eksperimental – Genap 2024', sumber: 'Laporan 20%', nilaiMin: 55, target: '60%', checked: true },
];

export const MK_SEMESTER_DETAIL_CPMK = [
  {
    nama: 'CPMK 1',
    deskripsi: 'Mahasiswa dapat menjelaskan konsep-konsep dasar yang terkait dengan aliran fluida, tekanan, gaya aerodinamika, dan hidrodinamika.',
    targetCapai: '55%',
    targetNilai: '60/100',
    rows: [
      { cpl: 'SO A PI 3', cplDesc: 'An ability to apply knowledge of engineering materials', sumber: 'Tugas Perancangan Kapal', bobot: 10 },
      { cpl: 'SO A PI 4', cplDesc: 'An ability to apply knowledge of engineering mechanics', sumber: 'Tugas Perancangan UAV', bobot: 10 },
    ],
  },
  {
    nama: 'CPMK 2',
    deskripsi: 'Mahasiswa dapat menginterpretasikan hasil simulasi dan menganalisis karakteristik aliran fluida.',
    targetCapai: '55%',
    targetNilai: '60/100',
    rows: [
      { cpl: 'SO C PI 3', cplDesc: 'An ability to analyze and interpret data', sumber: 'Laporan Perancangan Kapal', bobot: 15 },
      { cpl: 'SO E PI 2', cplDesc: 'An ability to apply estimation techniques and engineering heuristics', sumber: 'Laporan Perancangan UAV', bobot: 15 },
      { cpl: 'SO B PI 1', cplDesc: 'An ability to design component, system and/or process that meet specified needs', sumber: 'Laporan Perancangan Kapal', bobot: 5 },
      { cpl: 'SO B PI 2', cplDesc: 'An ability to take realistic constraints into design', sumber: 'Laporan Perancangan UAV', bobot: 5 },
    ],
  },
  {
    nama: 'CPMK 3',
    deskripsi: 'Mahasiswa dapat mengaplikasikan pemikiran kritis dan keterampilan pemecahan masalah untuk menganalisis masalah terkait aerodinamika dan hidrodinamika.',
    targetCapai: '55%',
    targetNilai: '60/100',
    rows: [
      { cpl: 'SO E PI 2', cplDesc: 'An ability to use CAD tools to draw mechanical components', sumber: 'Presentasi', bobot: 5 },
      { cpl: 'SO C PI 3', cplDesc: 'An ability to use general engineering software', sumber: 'Presentasi', bobot: 5 },
      { cpl: '', cplDesc: '', sumber: 'Presentasi', bobot: 5 },
    ],
  },
];

export const SUMBER_PENILAIAN_OPTIONS = ['Tugas', 'Quiz', 'UTS', 'UAS', 'Laporan', 'Presentasi', 'Lainnya'];

export const ATUR_CPMK_SEMESTER = [
  {
    id: 'cpmk1',
    nama: 'CPMK 1',
    deskripsi: 'Mahasiswa dapat menjelaskan konsep-konsep dasar yang terkait dengan aliran fluida, tekanan, gaya aerodinamika, dan hidrodinamika.',
    selected: true,
    targetCapai: 55,
    targetNilai: 60,
    skala: '100',
    cpl: [
      {
        id: 'cpl1',
        kode: 'SO A PI 3',
        deskripsi: 'An ability to apply knowledge of engineering materials',
        selected: true,
        sumber: [{ id: 's1', nama: 'Tugas', custom: 'Tugas Perancangan Kapal', bobot: 10 }],
      },
      {
        id: 'cpl2',
        kode: 'SO A PI 4',
        deskripsi: 'An ability to apply knowledge of engineering mechanics',
        selected: true,
        sumber: [{ id: 's2', nama: 'Tugas', custom: 'Tugas Perancangan UAV', bobot: 10 }],
      },
    ],
  },
  {
    id: 'cpmk2',
    nama: 'CPMK 2',
    deskripsi: 'Mahasiswa dapat menginterpretasikan hasil simulasi dan menganalisis karakteristik aliran fluida.',
    selected: true,
    targetCapai: 55,
    targetNilai: 60,
    skala: '100',
    cpl: [
      {
        id: 'cpl3',
        kode: 'SO C PI 3',
        deskripsi: 'An ability to analyze and interpret data',
        selected: true,
        sumber: [{ id: 's3', nama: 'Laporan', custom: 'Laporan Perancangan Kapal', bobot: 15 }],
      },
    ],
  },
  {
    id: 'cpmk3',
    nama: 'CPMK 3',
    deskripsi: 'Mahasiswa dapat mengaplikasikan pemikiran kritis untuk masalah aerodinamika dan hidrodinamika.',
    selected: false,
    targetCapai: 55,
    targetNilai: 60,
    skala: '100',
    cpl: [
      {
        id: 'cpl4',
        kode: 'SO E PI 2',
        deskripsi: 'An ability to use CAD tools for mechanical components',
        selected: false,
        sumber: [{ id: 's4', nama: 'Presentasi', custom: '', bobot: 5 }],
      },
    ],
  },
];

export const EVALUASI_CPMK = [
  {
    id: 'ev1',
    cpmk: 'CPMK 1',
    cpl: 'SO A PI 3',
    targetCapai: '55%',
    targetNilai: '60/100',
    nilaiMasuk: 6,
    rataRata: 78,
    jumlahLulus: 5,
    capaianTarget: '83%',
    evaluasi: 'Tercapai',
    tindakLanjut: { tt: 'Review rubrik tugas', prodi: '', departemen: '', fakultas: '' },
    usulan: { tt: 'Perkuat praktikum CFD', prodi: '', departemen: '', fakultas: '' },
  },
  {
    id: 'ev2',
    cpmk: 'CPMK 2',
    cpl: 'SO C PI 3',
    targetCapai: '55%',
    targetNilai: '60/100',
    nilaiMasuk: 6,
    rataRata: 64,
    jumlahLulus: 4,
    capaianTarget: '67%',
    evaluasi: 'Tercapai',
    tindakLanjut: { tt: '', prodi: '', departemen: '', fakultas: '' },
    usulan: { tt: '', prodi: '', departemen: '', fakultas: '' },
  },
  {
    id: 'ev3',
    cpmk: 'CPMK 3',
    cpl: 'SO E PI 2',
    targetCapai: '55%',
    targetNilai: '60/100',
    nilaiMasuk: 6,
    rataRata: 52,
    jumlahLulus: 2,
    capaianTarget: '33%',
    evaluasi: 'Belum tercapai',
    tindakLanjut: { tt: 'Remedial presentasi', prodi: '', departemen: '', fakultas: '' },
    usulan: { tt: 'Workshop presentasi teknis', prodi: '', departemen: '', fakultas: '' },
  },
];

export const EVALUASI_NILAI_PESERTA = [
  { bp: '2210912030', nama: 'A. FURQAN', cpmk1: 82, cpmk2: 74, cpmk3: 60, akhir: 74, huruf: 'B' },
  { bp: '2210913006', nama: 'AHMAD FAUZI', cpmk1: 88, cpmk2: 80, cpmk3: 70, akhir: 81, huruf: 'A' },
  { bp: '2210913012', nama: 'SITI RAHMA', cpmk1: 70, cpmk2: 58, cpmk3: 48, akhir: 61, huruf: 'C' },
  { bp: '2210913044', nama: 'BUDI SANTOSO', cpmk1: 76, cpmk2: 66, cpmk3: 54, akhir: 68, huruf: 'B' },
  { bp: '2110912001', nama: 'RINA PUTRI', cpmk1: 90, cpmk2: 84, cpmk3: 72, akhir: 84, huruf: 'A' },
];

export const DOKUMEN_EVALUASI = [
  { id: 'doc1', no: 1, nama: 'RPS Aero Hidro', keterangan: 'Rencana pembelajaran semester', berkas: 'rps-tms62280.pdf', uploader: 'Dendi Adi Saputra', waktu: '12 Juli 2025, 10:21' },
  { id: 'doc2', no: 2, nama: 'Rubrik Penilaian', keterangan: 'Rubrik CPMK 1–3', berkas: 'rubrik-cpmk.xlsx', uploader: 'Ilhamdi', waktu: '12 Juli 2025, 11:04' },
];

export const ROLES = [
  { id: 'role-superadmin', name: 'superadmin' },
  { id: 'role-admin', name: 'admin' },
  { id: 'role-dosen', name: 'dosen' },
  { id: 'role-mahasiswa', name: 'mahasiswa' },
];

export const PERMISSIONS = [
  { id: 'p-fakultas-read', name: 'fakultas.read', action: 'read', subject: 'Fakultas', group: 'institusi', description: 'Lihat fakultas' },
  { id: 'p-fakultas-create', name: 'fakultas.create', action: 'create', subject: 'Fakultas', group: 'institusi', description: 'Tambah fakultas' },
  { id: 'p-fakultas-update', name: 'fakultas.update', action: 'update', subject: 'Fakultas', group: 'institusi', description: 'Ubah fakultas' },
  { id: 'p-fakultas-delete', name: 'fakultas.delete', action: 'delete', subject: 'Fakultas', group: 'institusi', description: 'Arsipkan fakultas' },
  { id: 'p-fakultas-restore', name: 'fakultas.restore', action: 'restore', subject: 'Fakultas', group: 'institusi', description: 'Pulihkan fakultas' },
  { id: 'p-krs-read', name: 'krs.read', action: 'read', subject: 'Krs', group: 'krs', description: 'Lihat KRS' },
  { id: 'p-krs-create', name: 'krs.create', action: 'create', subject: 'Krs', group: 'krs', description: 'Buat KRS' },
  { id: 'p-krs-approve', name: 'krs.approve', action: 'approve', subject: 'Krs', group: 'krs', description: 'Setujui KRS' },
  { id: 'p-nilai-read', name: 'nilai.read', action: 'read', subject: 'NilaiMahasiswa', group: 'nilai', description: 'Lihat nilai' },
  { id: 'p-nilai-upload', name: 'nilai.upload', action: 'upload', subject: 'NilaiMahasiswa', group: 'nilai', description: 'Unggah nilai' },
  { id: 'p-user-read', name: 'user.read', action: 'read', subject: 'User', group: 'iam', description: 'Lihat user' },
  { id: 'p-user-assign', name: 'user.assign-roles', action: 'assign-roles', subject: 'User', group: 'iam', description: 'Assign role user' },
  { id: 'p-role-read', name: 'role.read', action: 'read', subject: 'Role', group: 'iam', description: 'Lihat role' },
  { id: 'p-role-sync', name: 'role.sync-permissions', action: 'sync-permissions', subject: 'Role', group: 'iam', description: 'Simpan matriks permission' },
  { id: 'p-laporan-read', name: 'laporan-cp.read', action: 'read', subject: 'LaporanCp', group: 'laporan', description: 'Lihat laporan CP' },
  { id: 'p-activity-read', name: 'activity-log.read', action: 'read', subject: 'ActivityLog', group: 'iam', description: 'Lihat jejak aktivitas' },
];

export const ROLE_PERMISSION_GRANTS = {
  'role-admin': PERMISSIONS.map((item) => item.id),
  'role-dosen': ['p-krs-read', 'p-krs-approve', 'p-nilai-read', 'p-nilai-upload', 'p-laporan-read'],
  'role-mahasiswa': ['p-krs-read', 'p-krs-create', 'p-laporan-read'],
};

export const USERS = [
  {
    id: 'user-admin',
    name: 'Admin Kurikulum',
    email: 'admin@email.com',
    role: 'admin',
    roles: [{ id: 'role-admin', name: 'admin' }],
    permissions: PERMISSIONS.map((item) => item.name),
  },
  {
    id: 'user-dosen',
    name: 'Dosen Pembimbing',
    email: 'dosen@email.com',
    role: 'dosen',
    roles: [{ id: 'role-dosen', name: 'dosen' }],
    permissions: ['krs.read', 'krs.approve', 'nilai.read', 'nilai.upload', 'laporan-cp.read'],
  },
  {
    id: 'user-multi',
    name: 'Dosen Admin',
    email: 'dosen.admin@email.com',
    role: 'admin',
    roles: [
      { id: 'role-admin', name: 'admin' },
      { id: 'role-dosen', name: 'dosen' },
    ],
    permissions: PERMISSIONS.map((item) => item.name),
  },
];

export const ACTIVITY_LOGS = [
  {
    id: 'log-1',
    createdAt: '2026-09-04T00:21:00+07:00',
    user_name: 'Admin Kurikulum',
    user_email: 'admin@email.com',
    action: 'create',
    subject: 'Fakultas',
    resource_id: 'fak-1',
    method: 'POST',
    path: '/fakultas',
    status_code: 201,
    ip: '127.0.0.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/139.0',
    summary: 'create Fakultas fak-1',
    payload: { kode_fakultas: 'FT', nama_resmi: 'Fakultas Teknik' },
  },
  {
    id: 'log-2',
    createdAt: '2026-09-04T00:24:00+07:00',
    user_name: 'Admin Kurikulum',
    user_email: 'admin@email.com',
    action: 'delete',
    subject: 'Fakultas',
    resource_id: 'fak-1',
    method: 'DELETE',
    path: '/fakultas/fak-1',
    status_code: 200,
    ip: '127.0.0.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/139.0',
    summary: 'delete Fakultas fak-1',
    payload: null,
  },
  {
    id: 'log-3',
    createdAt: '2026-09-04T00:25:00+07:00',
    user_name: 'Admin Kurikulum',
    user_email: 'admin@email.com',
    action: 'restore',
    subject: 'Fakultas',
    resource_id: 'fak-1',
    method: 'POST',
    path: '/fakultas/fak-1/restore',
    status_code: 200,
    ip: '127.0.0.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/139.0',
    summary: 'restore Fakultas fak-1',
    payload: null,
  },
  {
    id: 'log-4',
    createdAt: '2026-09-04T00:10:00+07:00',
    user_name: null,
    user_email: 'admin@email.com',
    action: 'login',
    subject: 'User',
    resource_id: null,
    method: 'POST',
    path: '/auth/login',
    status_code: 200,
    ip: '127.0.0.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/139.0',
    summary: 'login User',
    payload: { email: 'admin@email.com', password: '[redacted]' },
  },
];

export const JENIS_DOKUMEN_EVALUASI = [
  { no: 1, nama: 'RPS', tipe: 'PDF', keharusan: 'Wajib', keterangan: 'Rencana pembelajaran semester', status: 'Sudah diunggah' },
  { no: 2, nama: 'Rubrik Penilaian', tipe: 'XLSX', keharusan: 'Wajib', keterangan: 'Rubrik capaian CPMK', status: 'Sudah diunggah' },
  { no: 3, nama: 'Soal UAS', tipe: 'PDF', keharusan: 'Opsional', keterangan: 'Naskah soal ujian akhir', status: 'Belum ada' },
  { no: 4, nama: 'Berita Acara', tipe: 'PDF', keharusan: 'Wajib', keterangan: 'Berita acara evaluasi', status: 'Belum ada' },
];
