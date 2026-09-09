/**
 * Struktur Menu Navigasi Admin
 * Diadaptasi dari web lama (kurikulum/component/menu.php)
 * Item dengan `permission` hanya tampil jika user punya aksi itu.
 */
export const NAVIGATION_MENU = [
  {
    type: 'link',
    label: 'Dashboard',
    path: '/',
    icon: 'LayoutDashboard',
  },
  {
    type: 'group',
    title: 'Master Data',
    items: [
      {
        label: 'Fakultas',
        path: '/master/fakultas',
        icon: 'Landmark',
        permission: { action: 'read', subject: 'Fakultas' },
      },
      {
        label: 'Departemen',
        path: '/master/departemen',
        icon: 'Building2',
        permission: { action: 'read', subject: 'Departemen' },
      },
      {
        label: 'Program Studi',
        path: '/master/prodi',
        icon: 'GraduationCap',
        permission: { action: 'read', subject: 'ProgramStudi' },
      },
      {
        label: 'Mata Kuliah',
        path: '/master/matakuliah',
        icon: 'BookOpen',
        permission: { action: 'read', subject: 'Matakuliah' },
      },
      {
        label: 'Gedung',
        path: '/master/gedung',
        icon: 'Building',
        permission: { action: 'read', subject: 'Gedung' },
      },
      {
        label: 'Ruang',
        path: '/master/ruang',
        icon: 'DoorOpen',
        permission: { action: 'read', subject: 'Ruang' },
      },
      {
        label: 'Jenjang Akademik',
        path: '/master/jenjang-akademik',
        icon: 'TrendingUp',
        permission: { action: 'read', subject: 'JenjangAkademik' },
      },
      {
        label: 'Semester',
        icon: 'Calendar',
        children: [
          {
            label: 'Jenis Semester',
            path: '/master/semester/jenis',
            permission: { action: 'read', subject: 'JenisSemester' },
          },
          {
            label: 'Setting Semester',
            path: '/master/semester/setting',
            permission: { action: 'read', subject: 'Semester' },
          },
          {
            label: 'Periode',
            path: '/master/semester/periode',
            permission: { action: 'read', subject: 'Periode' },
          },
        ],
      },
    ],
  },
  {
    type: 'group',
    title: 'Kurikulum',
    items: [
      {
        label: 'Data Kurikulum',
        path: '/kurikulum/data',
        icon: 'Layers',
        permission: { action: 'read', subject: 'Kurikulum' },
      },
      {
        label: 'CP Kurikulum',
        path: '/kurikulum/cp',
        icon: 'FileCheck2',
        permission: { action: 'read', subject: 'Cp' },
      },
      {
        label: 'CPMK Kurikulum',
        path: '/kurikulum/cpmk',
        icon: 'Award',
        permission: { action: 'read', subject: 'Cpmk' },
      },
    ],
  },
  {
    type: 'group',
    title: 'Semester & Perkuliahan',
    items: [
      {
        label: 'Penawaran MK Semester',
        path: '/perkuliahan/penawaran-mk',
        icon: 'BookPlus',
        permission: { action: 'read', subject: 'PenawaranMatakuliah' },
      },
      {
        label: 'Persetujuan Penyelenggara',
        path: '/perkuliahan/persetujuan/host',
        icon: 'ListChecks',
        permission: { action: 'approve-host', subject: 'CrossEnrollment' },
      },
      {
        label: 'MK Semester',
        path: '/perkuliahan/mk-semester',
        icon: 'BookOpenCheck',
        permission: { action: 'read', subject: 'MatakuliahKurikulum' },
      },
      {
        label: 'Kelas',
        path: '/perkuliahan/kelas',
        icon: 'DoorOpen',
        permission: { action: 'read', subject: 'Kelas' },
      },
      {
        label: 'Upload Nilai',
        path: '/perkuliahan/upload-nilai',
        icon: 'UploadCloud',
        permission: { action: 'read', subject: 'NilaiMahasiswa' },
      },
      {
        label: 'Rekap Nilai CP',
        path: '/perkuliahan/rekap-cp',
        icon: 'BarChart3',
        permission: { action: 'read', subject: 'RekapCp' },
      },
      {
        label: 'Laporan CP',
        path: '/perkuliahan/laporan-cp',
        icon: 'FileSpreadsheet',
        permission: { action: 'read', subject: 'LaporanCp' },
      },
    ],
  },
  {
    type: 'group',
    title: 'KRS Mahasiswa',
    items: [
      { label: 'Katalog Lintas Prodi', path: '/mahasiswa/katalog-lintas-prodi', icon: 'LibraryBig', permission: { action: 'catalog', subject: 'PenawaranMatakuliah' } },
      { label: 'Status KRS Lintas Prodi', path: '/mahasiswa/status-krs-lintas', icon: 'Clock3', permission: { action: 'read', subject: 'CrossEnrollment' } },
    ],
  },
  {
    type: 'group',
    title: 'Pengguna & Akses',
    items: [
      {
        label: 'Pengguna',
        path: '/pengaturan/pengguna',
        icon: 'Users',
        permission: { action: 'read', subject: 'User' },
      },
      {
        label: 'Peran & Permission',
        path: '/pengaturan/peran',
        icon: 'Shield',
        permission: { action: 'read', subject: 'Role' },
      },
      {
        label: 'Aktivitas',
        path: '/pengaturan/aktivitas',
        icon: 'ScrollText',
        permission: { action: 'read', subject: 'ActivityLog' },
      },
    ],
  },
];
