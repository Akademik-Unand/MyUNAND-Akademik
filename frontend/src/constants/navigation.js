/**
 * Struktur Menu Navigasi Admin
 * Diadaptasi dari web lama (kurikulum/component/menu.php)
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
        label: 'Departemen',
        path: '/master/departemen',
        icon: 'Building2',
      },
      {
        label: 'Program Studi',
        path: '/master/prodi',
        icon: 'GraduationCap',
      },
      {
        label: 'Jenjang Akademik',
        path: '/master/jenjang-akademik',
        icon: 'TrendingUp',
      },
      {
        label: 'Semester',
        icon: 'Calendar',
        children: [
          {
            label: 'Jenis Semester',
            path: '/master/semester/jenis',
          },
          {
            label: 'Setting Semester',
            path: '/master/semester/setting',
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
      },
      {
        label: 'CP Kurikulum',
        path: '/kurikulum/cp',
        icon: 'FileCheck2',
      },
      {
        label: 'CPMK Kurikulum',
        path: '/kurikulum/cpmk',
        icon: 'Award',
      },
    ],
  },
  {
    type: 'group',
    title: 'Semester & Perkuliahan',
    items: [
      {
        label: 'MK Semester',
        path: '/perkuliahan/mk-semester',
        icon: 'BookOpenCheck',
      },
      {
        label: 'Kelas',
        path: '/perkuliahan/kelas',
        icon: 'DoorOpen',
      },
      {
        label: 'Upload Nilai',
        path: '/perkuliahan/upload-nilai',
        icon: 'UploadCloud',
      },
      {
        label: 'Rekap Nilai CP',
        path: '/perkuliahan/rekap-cp',
        icon: 'BarChart3',
      },
      {
        label: 'Laporan CP',
        path: '/perkuliahan/laporan-cp',
        icon: 'FileSpreadsheet',
      },
    ],
  },
];
