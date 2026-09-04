import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute, GuestRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { ProfilePage } from '../pages/auth/ProfilePage';
import { DashboardPage } from '../pages/DashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { FakultasPage } from '../pages/master/FakultasPage';
import { DepartemenPage } from '../pages/master/DepartemenPage';
import { ProdiPage } from '../pages/master/ProdiPage';
import { ProdiFormPage } from '../pages/master/ProdiFormPage';
import { JenjangAkademikPage } from '../pages/master/JenjangAkademikPage';
import { JenisSemesterPage } from '../pages/semester/JenisSemesterPage';
import { SettingSemesterPage } from '../pages/semester/SettingSemesterPage';
import { SettingSemesterFormPage } from '../pages/semester/SettingSemesterFormPage';
import { KurikulumDataPage } from '../pages/kurikulum/KurikulumDataPage';
import { KurikulumFormPage } from '../pages/kurikulum/KurikulumFormPage';
import { CPKurikulumPage } from '../pages/kurikulum/CPKurikulumPage';
import { CPMKKurikulumPage } from '../pages/kurikulum/CPMKKurikulumPage';
import { AturCPMKPage } from '../pages/kurikulum/AturCPMKPage';
import { MKSemesterPage } from '../pages/perkuliahan/MKSemesterPage';
import { MKSemesterKelolaPage } from '../pages/perkuliahan/MKSemesterKelolaPage';
import { MKTranskripAturPage } from '../pages/perkuliahan/MKTranskripAturPage';
import { AturCPMKSemesterPage } from '../pages/perkuliahan/AturCPMKSemesterPage';
import { EvaluasiCPMKPage } from '../pages/evaluasi/EvaluasiCPMKPage';
import { DokumenEvaluasiPage } from '../pages/evaluasi/DokumenEvaluasiPage';
import { KelasPage } from '../pages/perkuliahan/KelasPage';
import { KelasKelolaPage } from '../pages/perkuliahan/KelasKelolaPage';
import { UploadNilaiPage } from '../pages/nilai/UploadNilaiPage';
import { UploadNilaiKelolaPage } from '../pages/nilai/UploadNilaiKelolaPage';
import { RekapCPPage } from '../pages/evaluasi/RekapCPPage';
import { LaporanCPPage } from '../pages/evaluasi/LaporanCPPage';
import { LaporanCPFormPage } from '../pages/evaluasi/LaporanCPFormPage';
import { LaporanCPViewPage } from '../pages/evaluasi/LaporanCPViewPage';
import { UsersPage } from '../pages/iam/UsersPage';
import { RoleMatrixPage } from '../pages/iam/RoleMatrixPage';
import { ActivityLogsPage } from '../pages/iam/ActivityLogsPage';

export const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <MainLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'profil', element: <ProfilePage /> },

          { path: 'master/fakultas', element: <FakultasPage /> },
          { path: 'master/departemen', element: <DepartemenPage /> },
          { path: 'master/prodi/baru', element: <ProdiFormPage /> },
          { path: 'master/prodi/:id/edit', element: <ProdiFormPage /> },
          { path: 'master/prodi', element: <ProdiPage /> },
          { path: 'master/jenjang-akademik', element: <JenjangAkademikPage /> },
          { path: 'master/semester/jenis', element: <JenisSemesterPage /> },
          { path: 'master/semester/setting/baru', element: <SettingSemesterFormPage /> },
          { path: 'master/semester/setting/:id/edit', element: <SettingSemesterFormPage /> },
          { path: 'master/semester/setting', element: <SettingSemesterPage /> },

          { path: 'kurikulum/data/baru', element: <KurikulumFormPage /> },
          { path: 'kurikulum/data/:id/edit', element: <KurikulumFormPage /> },
          { path: 'kurikulum/data', element: <KurikulumDataPage /> },
          { path: 'kurikulum/cp', element: <CPKurikulumPage /> },
          { path: 'kurikulum/cpmk/:id', element: <AturCPMKPage /> },
          { path: 'kurikulum/cpmk', element: <CPMKKurikulumPage /> },

          { path: 'perkuliahan/mk-semester/transkrip/atur', element: <MKTranskripAturPage /> },
          { path: 'perkuliahan/mk-semester/:id/atur', element: <AturCPMKSemesterPage /> },
          { path: 'perkuliahan/mk-semester/:id/evaluasi', element: <EvaluasiCPMKPage /> },
          { path: 'perkuliahan/mk-semester/:id/dokumen', element: <DokumenEvaluasiPage /> },
          { path: 'perkuliahan/mk-semester/:id', element: <MKSemesterKelolaPage /> },
          { path: 'perkuliahan/mk-semester', element: <MKSemesterPage /> },
          { path: 'perkuliahan/kelas/:id', element: <KelasKelolaPage /> },
          { path: 'perkuliahan/kelas', element: <KelasPage /> },
          { path: 'perkuliahan/upload-nilai/:id', element: <UploadNilaiKelolaPage /> },
          { path: 'perkuliahan/upload-nilai', element: <UploadNilaiPage /> },
          { path: 'perkuliahan/rekap-cp', element: <RekapCPPage /> },
          { path: 'perkuliahan/laporan-cp/baru', element: <LaporanCPFormPage /> },
          { path: 'perkuliahan/laporan-cp/:id/edit', element: <LaporanCPFormPage /> },
          { path: 'perkuliahan/laporan-cp/:id', element: <LaporanCPViewPage /> },
          { path: 'perkuliahan/laporan-cp', element: <LaporanCPPage /> },
          { path: 'pengaturan/pengguna', element: <UsersPage /> },
          { path: 'pengaturan/peran', element: <RoleMatrixPage /> },
          { path: 'pengaturan/aktivitas', element: <ActivityLogsPage /> },

          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
