import { createBrowserRouter } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute, GuestRoute } from './ProtectedRoute';
import { PermissionRoute } from './PermissionRoute';
import { LoginPage } from '../pages/auth/LoginPage';
import { ProfilePage } from '../pages/auth/ProfilePage';
import { DashboardPage } from '../pages/DashboardPage';
import { NotFoundPage } from '../pages/NotFoundPage';

const gate = (I, a, element) => <PermissionRoute I={I} a={a}>{element}</PermissionRoute>;
const gateAny = (any, element) => <PermissionRoute any={any}>{element}</PermissionRoute>;
import { FakultasPage } from '../pages/master/FakultasPage';
import { DepartemenPage } from '../pages/master/DepartemenPage';
import { ProdiPage } from '../pages/master/ProdiPage';
import { ProdiFormPage } from '../pages/master/ProdiFormPage';
import { JenjangAkademikPage } from '../pages/master/JenjangAkademikPage';
import { JenisSemesterPage } from '../pages/semester/JenisSemesterPage';
import { SettingSemesterPage } from '../pages/semester/SettingSemesterPage';
import { SettingSemesterFormPage } from '../pages/semester/SettingSemesterFormPage';
import { PeriodePage } from '../pages/semester/PeriodePage';
import { KurikulumDataPage } from '../pages/kurikulum/KurikulumDataPage';
import { KurikulumFormPage } from '../pages/kurikulum/KurikulumFormPage';
import { CPKurikulumPage } from '../pages/kurikulum/CPKurikulumPage';
import { CPMKKurikulumPage } from '../pages/kurikulum/CPMKKurikulumPage';
import { AturCPMKPage } from '../pages/kurikulum/AturCPMKPage';
import { CpmkFormPage } from '../pages/kurikulum/CpmkFormPage';
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

          { path: 'master/fakultas', element: gate('read', 'Fakultas', <FakultasPage />) },
          { path: 'master/departemen', element: gate('read', 'Departemen', <DepartemenPage />) },
          { path: 'master/prodi/baru', element: gate('create', 'ProgramStudi', <ProdiFormPage />) },
          { path: 'master/prodi/:id/edit', element: gate('update', 'ProgramStudi', <ProdiFormPage />) },
          { path: 'master/prodi', element: gate('read', 'ProgramStudi', <ProdiPage />) },
          { path: 'master/jenjang-akademik', element: gate('read', 'JenjangAkademik', <JenjangAkademikPage />) },
          { path: 'master/semester/jenis', element: gate('read', 'JenisSemester', <JenisSemesterPage />) },
          { path: 'master/semester/setting/baru', element: gate('create', 'Semester', <SettingSemesterFormPage />) },
          { path: 'master/semester/setting/:id/edit', element: gate('update', 'Semester', <SettingSemesterFormPage />) },
          { path: 'master/semester/setting', element: gate('read', 'Semester', <SettingSemesterPage />) },
          { path: 'master/semester/periode', element: gate('read', 'Periode', <PeriodePage />) },

          { path: 'kurikulum/data/baru', element: gate('create', 'Kurikulum', <KurikulumFormPage />) },
          { path: 'kurikulum/data/:id/edit', element: gate('update', 'Kurikulum', <KurikulumFormPage />) },
          { path: 'kurikulum/data', element: gate('read', 'Kurikulum', <KurikulumDataPage />) },
          { path: 'kurikulum/cp', element: gate('read', 'Cp', <CPKurikulumPage />) },
          { path: 'kurikulum/cpmk/:id/:cpmkId/sub/baru', element: gateAny([{ I: 'create', a: 'Cpmk' }, { I: 'update', a: 'Cpmk' }], <CpmkFormPage />) },
          { path: 'kurikulum/cpmk/:id/:cpmkId/edit', element: gateAny([{ I: 'create', a: 'Cpmk' }, { I: 'update', a: 'Cpmk' }], <CpmkFormPage />) },
          { path: 'kurikulum/cpmk/:id/baru', element: gateAny([{ I: 'create', a: 'Cpmk' }, { I: 'update', a: 'Cpmk' }], <CpmkFormPage />) },
          { path: 'kurikulum/cpmk/:id', element: gateAny([{ I: 'create', a: 'Cpmk' }, { I: 'update', a: 'Cpmk' }], <AturCPMKPage />) },
          { path: 'kurikulum/cpmk', element: gate('read', 'Cpmk', <CPMKKurikulumPage />) },

          { path: 'perkuliahan/mk-semester/transkrip/atur', element: gate('update', 'MatakuliahKurikulum', <MKTranskripAturPage />) },
          { path: 'perkuliahan/mk-semester/:id/atur', element: gate('update', 'Cpmk', <AturCPMKSemesterPage />) },
          { path: 'perkuliahan/mk-semester/:id/evaluasi', element: gate('read', 'EvaluasiCpmk', <EvaluasiCPMKPage />) },
          { path: 'perkuliahan/mk-semester/:id/dokumen', element: gate('read', 'DokumenEvaluasi', <DokumenEvaluasiPage />) },
          { path: 'perkuliahan/mk-semester/:id', element: gate('read', 'MatakuliahKurikulum', <MKSemesterKelolaPage />) },
          { path: 'perkuliahan/mk-semester', element: gate('read', 'MatakuliahKurikulum', <MKSemesterPage />) },
          { path: 'perkuliahan/kelas/:id', element: gate('read', 'Kelas', <KelasKelolaPage />) },
          { path: 'perkuliahan/kelas', element: gate('read', 'Kelas', <KelasPage />) },
          {
            path: 'perkuliahan/upload-nilai/:id',
            element: gateAny(
              [
                { I: 'upload', a: 'NilaiMahasiswa' },
                { I: 'update', a: 'NilaiMahasiswa' },
              ],
              <UploadNilaiKelolaPage />,
            ),
          },
          { path: 'perkuliahan/upload-nilai', element: gate('read', 'NilaiMahasiswa', <UploadNilaiPage />) },
          { path: 'perkuliahan/rekap-cp', element: gate('read', 'RekapCp', <RekapCPPage />) },
          { path: 'perkuliahan/laporan-cp/baru', element: gate('create', 'LaporanCp', <LaporanCPFormPage />) },
          { path: 'perkuliahan/laporan-cp/:id/edit', element: gate('update', 'LaporanCp', <LaporanCPFormPage />) },
          { path: 'perkuliahan/laporan-cp/:id', element: gate('read', 'LaporanCp', <LaporanCPViewPage />) },
          { path: 'perkuliahan/laporan-cp', element: gate('read', 'LaporanCp', <LaporanCPPage />) },
          { path: 'pengaturan/pengguna', element: gate('read', 'User', <UsersPage />) },
          { path: 'pengaturan/peran', element: gate('read', 'Role', <RoleMatrixPage />) },
          { path: 'pengaturan/aktivitas', element: gate('read', 'ActivityLog', <ActivityLogsPage />) },

          { path: '*', element: <NotFoundPage /> },
        ],
      },
    ],
  },
]);
