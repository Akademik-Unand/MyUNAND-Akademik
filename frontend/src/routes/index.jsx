import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute, GuestRoute } from './ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { DashboardPage } from '../pages/DashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { FakultasPage } from '../pages/FakultasPage';
import { DepartemenPage } from '../pages/DepartemenPage';
import { ProdiPage } from '../pages/ProdiPage';
import { ProdiFormPage } from '../pages/ProdiFormPage';
import { JenjangAkademikPage } from '../pages/JenjangAkademikPage';
import { JenisSemesterPage } from '../pages/JenisSemesterPage';
import { SettingSemesterPage } from '../pages/SettingSemesterPage';
import { SettingSemesterFormPage } from '../pages/SettingSemesterFormPage';
import { KurikulumDataPage } from '../pages/KurikulumDataPage';
import { KurikulumFormPage } from '../pages/KurikulumFormPage';
import { CPKurikulumPage } from '../pages/CPKurikulumPage';
import { CPMKKurikulumPage } from '../pages/CPMKKurikulumPage';
import { AturCPMKPage } from '../pages/AturCPMKPage';
import { MKSemesterPage } from '../pages/MKSemesterPage';
import { MKSemesterKelolaPage } from '../pages/MKSemesterKelolaPage';
import { MKTranskripAturPage } from '../pages/MKTranskripAturPage';
import { AturCPMKSemesterPage } from '../pages/AturCPMKSemesterPage';
import { EvaluasiCPMKPage } from '../pages/EvaluasiCPMKPage';
import { DokumenEvaluasiPage } from '../pages/DokumenEvaluasiPage';
import { KelasPage } from '../pages/KelasPage';
import { KelasKelolaPage } from '../pages/KelasKelolaPage';
import { UploadNilaiPage } from '../pages/UploadNilaiPage';
import { UploadNilaiKelolaPage } from '../pages/UploadNilaiKelolaPage';
import { RekapCPPage } from '../pages/RekapCPPage';
import { LaporanCPPage } from '../pages/LaporanCPPage';
import { LaporanCPFormPage } from '../pages/LaporanCPFormPage';
import { LaporanCPViewPage } from '../pages/LaporanCPViewPage';

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
      { path: 'master/prodi/:kode/edit', element: <ProdiFormPage /> },
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
      { path: 'kurikulum/cpmk/:kode', element: <AturCPMKPage /> },
      { path: 'kurikulum/cpmk', element: <CPMKKurikulumPage /> },

      { path: 'perkuliahan/mk-semester/transkrip/atur', element: <MKTranskripAturPage /> },
      { path: 'perkuliahan/mk-semester/:kode/atur', element: <AturCPMKSemesterPage /> },
      { path: 'perkuliahan/mk-semester/:kode/evaluasi', element: <EvaluasiCPMKPage /> },
      { path: 'perkuliahan/mk-semester/:kode/dokumen', element: <DokumenEvaluasiPage /> },
      { path: 'perkuliahan/mk-semester/:kode', element: <MKSemesterKelolaPage /> },
      { path: 'perkuliahan/mk-semester', element: <MKSemesterPage /> },
      { path: 'perkuliahan/kelas/:kode', element: <KelasKelolaPage /> },
      { path: 'perkuliahan/kelas', element: <KelasPage /> },
      { path: 'perkuliahan/upload-nilai/:kode', element: <UploadNilaiKelolaPage /> },
      { path: 'perkuliahan/upload-nilai', element: <UploadNilaiPage /> },
      { path: 'perkuliahan/rekap-cp', element: <RekapCPPage /> },
      { path: 'perkuliahan/laporan-cp/baru', element: <LaporanCPFormPage /> },
      { path: 'perkuliahan/laporan-cp/:id/edit', element: <LaporanCPFormPage /> },
      { path: 'perkuliahan/laporan-cp/:id', element: <LaporanCPViewPage /> },
      { path: 'perkuliahan/laporan-cp', element: <LaporanCPPage /> },

          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
