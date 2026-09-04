'use strict';

const FIRST_NAMES = [
  'Andi', 'Budi', 'Citra', 'Dewi', 'Eka', 'Fajar', 'Gita', 'Hadi', 'Intan', 'Joko',
  'Kartika', 'Lina', 'Maya', 'Nanda', 'Omar', 'Putri', 'Raka', 'Sari', 'Tono', 'Umi',
  'Vina', 'Wawan', 'Yuni', 'Zaki', 'Ayu', 'Bagus', 'Cahya', 'Dina', 'Farhan', 'Hana',
];
const LAST_NAMES = [
  'Pratama', 'Wijaya', 'Saputra', 'Lestari', 'Nugroho', 'Santoso', 'Maharani', 'Putra',
  'Sari', 'Hidayat', 'Rahman', 'Kusuma', 'Wibowo', 'Anggraini', 'Syahputra',
];

const SI_MATAKULIAH = [
  { kode: 'SI1102', nama: 'Kalkulus I', semester: 1, sks: 3, teori: 3, prak: 0, status: 'Wajib' },
  { kode: 'SI1103', nama: 'Pengantar Sistem Informasi', semester: 1, sks: 2, teori: 2, prak: 0, status: 'Wajib' },
  { kode: 'SI1104', nama: 'Matematika Diskrit', semester: 1, sks: 3, teori: 3, prak: 0, status: 'Wajib' },
  { kode: 'SI1105', nama: 'Bahasa Inggris Akademik', semester: 1, sks: 2, teori: 2, prak: 0, status: 'Wajib' },
  { kode: 'SI1201', nama: 'Aljabar Linear', semester: 2, sks: 3, teori: 3, prak: 0, status: 'Wajib' },
  { kode: 'SI1202', nama: 'Pemrograman Web', semester: 2, sks: 3, teori: 2, prak: 1, status: 'Wajib' },
  { kode: 'SI2101', nama: 'Struktur Data', semester: 3, sks: 3, teori: 2, prak: 1, status: 'Wajib' },
  { kode: 'SI2102', nama: 'Pemrograman Berorientasi Objek', semester: 3, sks: 3, teori: 2, prak: 1, status: 'Wajib' },
  { kode: 'SI2104', nama: 'Jaringan Komputer', semester: 3, sks: 3, teori: 2, prak: 1, status: 'Wajib' },
  { kode: 'SI2105', nama: 'Statistika dan Probabilitas', semester: 3, sks: 3, teori: 3, prak: 0, status: 'Wajib' },
  { kode: 'SI2201', nama: 'Rekayasa Perangkat Lunak', semester: 4, sks: 3, teori: 3, prak: 0, status: 'Wajib' },
  { kode: 'SI2202', nama: 'Sistem Operasi', semester: 4, sks: 3, teori: 2, prak: 1, status: 'Wajib' },
  { kode: 'SI2203', nama: 'Interaksi Manusia dan Komputer', semester: 4, sks: 3, teori: 3, prak: 0, status: 'Wajib' },
  { kode: 'SI3101', nama: 'Kecerdasan Buatan', semester: 5, sks: 3, teori: 2, prak: 1, status: 'Pilihan' },
];

const MAT_MATAKULIAH = [
  { kode: 'MAT1101', nama: 'Kalkulus I', semester: 1, sks: 4, teori: 4, prak: 0, status: 'Wajib' },
  { kode: 'MAT1102', nama: 'Aljabar Linear Elementer', semester: 1, sks: 3, teori: 3, prak: 0, status: 'Wajib' },
  { kode: 'MAT2101', nama: 'Analisis Real', semester: 3, sks: 3, teori: 3, prak: 0, status: 'Wajib' },
  { kode: 'MAT2102', nama: 'Persamaan Diferensial Biasa', semester: 3, sks: 3, teori: 3, prak: 0, status: 'Wajib' },
];

const SI_CP = [
  {
    key: 'cpl02',
    nama: 'CPL-02: Fondasi sistem informasi',
    deskripsi: 'Mampu menjelaskan konsep, proses bisnis, dan peran sistem informasi di organisasi.',
    scp: [
      { key: 'scp021', nama: 'SCP-02.1 Konsep SI dan proses bisnis' },
      { key: 'scp022', nama: 'SCP-02.2 Analisis kebutuhan sistem' },
    ],
  },
  {
    key: 'cpl03',
    nama: 'CPL-03: Pemrograman dan algoritma',
    deskripsi: 'Mampu merancang dan mengimplementasikan solusi perangkat lunak.',
    scp: [
      { key: 'scp031', nama: 'SCP-03.1 Struktur data dan algoritma' },
      { key: 'scp032', nama: 'SCP-03.2 Pemrograman berorientasi objek' },
    ],
  },
  {
    key: 'cpl04',
    nama: 'CPL-04: Data dan basis data',
    deskripsi: 'Mampu merancang dan mengelola data organisasi.',
    scp: [
      { key: 'scp041', nama: 'SCP-04.1 Model data relasional' },
      { key: 'scp042', nama: 'SCP-04.2 Query dan integritas data' },
    ],
  },
  {
    key: 'cpl05',
    nama: 'CPL-05: Infrastruktur dan jaringan',
    deskripsi: 'Mampu merancang infrastruktur komputasi dan jaringan.',
    scp: [
      { key: 'scp051', nama: 'SCP-05.1 Konsep jaringan' },
      { key: 'scp052', nama: 'SCP-05.2 Sistem operasi dan layanan' },
    ],
  },
  {
    key: 'cpl06',
    nama: 'CPL-06: Profesionalisme',
    deskripsi: 'Mampu berkomunikasi dan bekerja secara etis dalam tim.',
    scp: [
      { key: 'scp061', nama: 'SCP-06.1 Komunikasi akademik' },
      { key: 'scp062', nama: 'SCP-06.2 Etika profesi TI' },
    ],
  },
  {
    key: 'cpl07',
    nama: 'CPL-07: Analisis kuantitatif',
    deskripsi: 'Mampu menerapkan metode matematis dan statistika.',
    scp: [
      { key: 'scp071', nama: 'SCP-07.1 Model matematis' },
      { key: 'scp072', nama: 'SCP-07.2 Inferensi statistika' },
    ],
  },
];

const MAT_CP = [
  {
    key: 'mcpl01',
    nama: 'CPL-01: Penalaran matematis',
    deskripsi: 'Mampu menalar secara logis dan menuliskan bukti.',
    scp: [
      { key: 'mscp011', nama: 'SCP-01.1 Logika dan bukti' },
      { key: 'mscp012', nama: 'SCP-01.2 Abstraksi konsep' },
    ],
  },
  {
    key: 'mcpl02',
    nama: 'CPL-02: Analisis dan aljabar',
    deskripsi: 'Mampu menerapkan kalkulus dan aljabar pada masalah nyata.',
    scp: [
      { key: 'mscp021', nama: 'SCP-02.1 Kalkulus' },
      { key: 'mscp022', nama: 'SCP-02.2 Aljabar linear' },
    ],
  },
];

const SI_CPMK = [
  { mk: 'SI1101', hasSub: false, scp: ['scp031'] },
  { mk: 'SI1101', hasSub: true, scp: ['scp031', 'scp032'] },
  { mk: 'SI1102', hasSub: false, scp: ['scp071'] },
  { mk: 'SI1102', hasSub: true, scp: ['scp071', 'scp072'] },
  { mk: 'SI1103', hasSub: false, scp: ['scp021'] },
  { mk: 'SI1103', hasSub: true, scp: ['scp021', 'scp022'] },
  { mk: 'SI1104', hasSub: false, scp: ['scp071'] },
  { mk: 'SI1104', hasSub: true, scp: ['scp031', 'scp071'] },
  { mk: 'SI1105', hasSub: false, scp: ['scp061'] },
  { mk: 'SI2103', hasSub: false, scp: ['scp041'] },
  { mk: 'SI2103', hasSub: true, scp: ['scp041', 'scp042'] },
  { mk: 'SI2101', hasSub: false, scp: ['scp031'] },
  { mk: 'SI2101', hasSub: true, scp: ['scp031', 'scp032'] },
  { mk: 'SI2102', hasSub: false, scp: ['scp032'] },
  { mk: 'SI2102', hasSub: true, scp: ['scp032', 'scp062'] },
  { mk: 'SI2104', hasSub: false, scp: ['scp051'] },
  { mk: 'SI2104', hasSub: true, scp: ['scp051', 'scp052'] },
  { mk: 'SI2105', hasSub: false, scp: ['scp072'] },
  { mk: 'SI2105', hasSub: true, scp: ['scp071', 'scp072'] },
  { mk: 'SI1201', hasSub: false, scp: ['scp071'] },
  { mk: 'SI1202', hasSub: true, scp: ['scp032', 'scp022'] },
  { mk: 'SI2201', hasSub: true, scp: ['scp022', 'scp062'] },
  { mk: 'SI2202', hasSub: false, scp: ['scp052'] },
  { mk: 'SI2203', hasSub: false, scp: ['scp061'] },
  { mk: 'SI3101', hasSub: true, scp: ['scp031', 'scp072'] },
];

const MAT_CPMK = [
  { mk: 'MAT1101', hasSub: false, scp: ['mscp021'] },
  { mk: 'MAT1101', hasSub: true, scp: ['mscp021', 'mscp011'] },
  { mk: 'MAT1102', hasSub: false, scp: ['mscp022'] },
  { mk: 'MAT2101', hasSub: true, scp: ['mscp011', 'mscp012'] },
  { mk: 'MAT2102', hasSub: false, scp: ['mscp021'] },
];

const DOSEN_SI = [
  { nip: '197903011990031001', nidn: '0001037901', nama: 'Prof. Dr. Rina Komala, M.Kom' },
  { nip: '198104021995031002', nidn: '0002048102', nama: 'Dr. Agus Setiawan, M.T.' },
  { nip: '198206151998032003', nidn: '0015068203', nama: 'Dr. Laila Fitri, S.Kom., M.Cs' },
  { nip: '198307201999031004', nidn: '0020078304', nama: 'Yusuf Hamzah, S.T., M.Kom' },
  { nip: '198411112000032005', nidn: '0011118405', nama: 'Nurul Aini, M.Kom' },
  { nip: '198512252001031006', nidn: '0025128506', nama: 'Ir. Bambang Prakoso, M.T.' },
];

const DOSEN_MAT = [
  { nip: '197705051988031007', nidn: '0005057707', nama: 'Prof. Dr. Suryadi, M.Si' },
  { nip: '198008171993032008', nidn: '0017088008', nama: 'Dr. Mega Wulandari, M.Si' },
];

const RUANG = [
  { kode: 'R.H-102', nama: 'Ruang Kuliah Gedung H 102', kapasitas: 40 },
  { kode: 'R.H-103', nama: 'Ruang Kuliah Gedung H 103', kapasitas: 40 },
  { kode: 'R.H-201', nama: 'Laboratorium Pemrograman H 201', kapasitas: 30 },
  { kode: 'R.H-202', nama: 'Laboratorium Jaringan H 202', kapasitas: 30 },
  { kode: 'R.I-101', nama: 'Ruang Kuliah Gedung I 101', kapasitas: 50 },
  { kode: 'R.I-102', nama: 'Ruang Kuliah Gedung I 102', kapasitas: 50 },
];

const HARI = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];
const JAM = [
  ['08:00:00', '09:40:00'],
  ['10:00:00', '11:40:00'],
  ['13:00:00', '14:40:00'],
  ['15:00:00', '16:40:00'],
];

const studentName = (index) => {
  const first = FIRST_NAMES[index % FIRST_NAMES.length];
  const last = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  return `${first} ${last}`;
};

module.exports = {
  SI_MATAKULIAH,
  MAT_MATAKULIAH,
  SI_CP,
  MAT_CP,
  SI_CPMK,
  MAT_CPMK,
  DOSEN_SI,
  DOSEN_MAT,
  RUANG,
  HARI,
  JAM,
  studentName,
};
