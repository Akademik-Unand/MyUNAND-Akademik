import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { Can } from '../auth/Can';
import { semesterAkademikLabel, prodiDepartemenLabel } from '../../helpers/semesterProdi';
import {
  kelasDisplayName,
  kelasDosenNames,
  kurikulumLabel,
  matakuliahKurikulumId,
  periodeInputNilai,
  pickKurikulum,
} from '../../helpers/kelasInfo';

const Field = ({ label, children }) => (
  <div>
    <p className="text-xs text-base-content/60">{label}</p>
    <div className="text-sm font-medium">{children ?? '—'}</div>
  </div>
);

export const KelasInfoCard = ({ kelas }) => {
  const mkId = matakuliahKurikulumId(kelas);
  const periode = periodeInputNilai(kelas);
  const peserta = kelas?.jumlah_peserta;

  return (
    <Card title="Informasi Kelas">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <div className="space-y-4">
          <Field label="Nama Kelas">{kelasDisplayName(kelas)}</Field>
          <Field label="Mata Kuliah">
            <span className="text-primary">{kelas?.matakuliah?.nama_resmi || '—'}</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {mkId && (
                <>
                  <Can I="update" a="Cpmk">
                    <Link to={`/perkuliahan/mk-semester/${mkId}/atur`} className="btn btn-success btn-xs">
                      CPMK Semester
                    </Link>
                  </Can>
                  <Can I="read" a="EvaluasiCpmk">
                    <Link to={`/perkuliahan/mk-semester/${mkId}/evaluasi`} className="btn btn-success btn-xs">
                      Evaluasi Semester
                    </Link>
                  </Can>
                  <Can I="read" a="DokumenEvaluasi">
                    <Link to={`/perkuliahan/mk-semester/${mkId}/dokumen`} className="btn btn-success btn-xs">
                      Upload Dokumen Semester
                    </Link>
                  </Can>
                </>
              )}
            </div>
          </Field>
          <Field label="Semester">{semesterAkademikLabel(kelas?.semesterProdi?.semester)}</Field>
          <Field label="Program Studi">{prodiDepartemenLabel(kelas?.semesterProdi?.programStudi)}</Field>
          <Field label="Kurikulum">{kurikulumLabel(pickKurikulum(kelas))}</Field>
          <Field label="Jumlah Peserta">{peserta == null ? '—' : peserta}</Field>
        </div>
        <div className="space-y-4">
          <Field label="Input Nilai">
            {periode.label}
            {periode.hasRange && (
              <p className={`mt-1 text-sm ${periode.boleh ? 'text-success' : 'text-error'}`}>
                {periode.boleh ? 'Boleh input nilai' : 'Belum boleh input nilai'}
              </p>
            )}
          </Field>
          <Field label="Dosen">{kelasDosenNames(kelas)}</Field>
        </div>
      </div>
    </Card>
  );
};
