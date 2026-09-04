import { consecutiveRowSpans } from '../../helpers/tableSpans';
import { formatCapaian, formatPercent, TINDAK_LANJUT_UNIT } from '../../helpers/laporanCp';
import { useTableHeadOffset } from '../../hooks/useTableHeadOffset';
import { LaporanCpStickyCell } from './LaporanCpStickyCell';

const cpKey = (row) => row.cp_id;
const scpKey = (row) => `${row.cp_id}\u001f${row.scp_id}`;

const noteValue = (row, prefix, unit) => row[`${prefix}_${unit}`] || '';

export const LaporanCpReportTable = ({ rows = [], onMatakuliahClick }) => {
  const { headRef, offset } = useTableHeadOffset(rows.length);
  const cpSpans = consecutiveRowSpans(rows, cpKey);
  const scpSpans = consecutiveRowSpans(rows, scpKey);
  const stickyStyle = { top: offset };

  if (!rows.length) {
    return <p className="text-sm text-base-content/60">Belum ada mata kuliah yang dipilih pada laporan ini.</p>;
  }

  return (
    <div className="max-h-[70vh] overflow-auto">
      <table className="table table-sm w-full min-w-[96rem]">
        <thead ref={headRef} className="sticky top-0 z-30">
          <tr className="text-xs uppercase text-base-content/60">
            <th rowSpan={2} className="bg-base-100 align-bottom">CP</th>
            <th rowSpan={2} className="bg-base-100 align-bottom">SCP</th>
            <th rowSpan={2} className="bg-base-100 align-bottom">CPMK</th>
            <th rowSpan={2} className="bg-base-100 align-bottom">Mata Kuliah</th>
            <th rowSpan={2} className="bg-base-100 align-bottom">Dosen Pengampu</th>
            <th rowSpan={2} className="bg-base-100 align-bottom">Sumber Penilaian</th>
            <th rowSpan={2} className="bg-base-100 align-bottom">Nilai Minimal</th>
            <th rowSpan={2} className="bg-base-100 align-bottom">Target Kelulusan CPMK</th>
            <th rowSpan={2} className="bg-base-100 align-bottom">Capaian Kelulusan CPMK</th>
            <th rowSpan={2} className="bg-base-100 align-bottom">Capaian Kelulusan SCP</th>
            <th rowSpan={2} className="bg-base-100 align-bottom">Capaian Kelulusan CP</th>
            <th rowSpan={2} className="bg-base-100 align-bottom">Evaluasi</th>
            <th colSpan={4} className="bg-base-100 text-center">Tindak Lanjut Sudah Dilakukan</th>
            <th colSpan={4} className="bg-base-100 text-center">Usulan Tindak Lanjut Sistemik</th>
          </tr>
          <tr className="text-xs uppercase text-base-content/60">
            {TINDAK_LANJUT_UNIT.map((unit) => (
              <th key={`tl-${unit.key}`} className="bg-base-100 font-normal normal-case">
                {unit.label}
              </th>
            ))}
            {TINDAK_LANJUT_UNIT.map((unit) => (
              <th key={`us-${unit.key}`} className="bg-base-100 font-normal normal-case">
                {unit.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const cpSpan = cpSpans[idx];
            const scpSpan = scpSpans[idx];
            return (
              <tr key={row.id}>
                {cpSpan > 0 && (
                  <LaporanCpStickyCell rowSpan={cpSpan} style={stickyStyle}>
                    <p className="font-semibold">{row.cp_nama}</p>
                    {row.cp_deskripsi && (
                      <p className="mt-1 text-xs text-base-content/60 whitespace-normal">{row.cp_deskripsi}</p>
                    )}
                  </LaporanCpStickyCell>
                )}
                {scpSpan > 0 && (
                  <LaporanCpStickyCell rowSpan={scpSpan} style={stickyStyle}>
                    <p className="font-semibold">{row.scp_nama}</p>
                    {row.scp_deskripsi && (
                      <p className="mt-1 text-xs text-base-content/60 whitespace-normal">{row.scp_deskripsi}</p>
                    )}
                  </LaporanCpStickyCell>
                )}
                <td className="align-top max-w-sm">
                  <p className="font-medium">{row.cpmk_nama}</p>
                  {row.cpmk_deskripsi && (
                    <p className="mt-1 text-xs text-base-content/60 whitespace-normal">{row.cpmk_deskripsi}</p>
                  )}
                </td>
                <td className="align-top">
                  {onMatakuliahClick ? (
                    <button
                      type="button"
                      onClick={() => onMatakuliahClick(row)}
                      className="link link-hover text-left font-medium text-primary"
                      title="Lihat detail evaluasi mata kuliah"
                    >
                      {row.matakuliah_nama || '—'}
                    </button>
                  ) : (
                    <p>{row.matakuliah_nama || '—'}</p>
                  )}
                  {row.semester_label?.trim() && (
                    <p className="text-xs text-base-content/60">{row.semester_label.trim()}</p>
                  )}
                </td>
                <td className="align-top max-w-xs whitespace-normal">{row.dosen_label || '—'}</td>
                <td className="align-top whitespace-normal">{row.sumber_label || '—'}</td>
                <td className="align-middle text-center">{row.nilai_min ?? '—'}</td>
                <td className="align-middle text-center">{formatPercent(row.target_persen)}</td>
                <td className="align-middle text-center">{formatCapaian(row.capaian)}</td>
                {scpSpan > 0 && (
                  <td rowSpan={scpSpan > 1 ? scpSpan : undefined} className="align-middle text-center bg-base-100">
                    {formatCapaian(row.capaian_scp)}
                  </td>
                )}
                {cpSpan > 0 && (
                  <td rowSpan={cpSpan > 1 ? cpSpan : undefined} className="align-middle text-center bg-base-100">
                    {formatCapaian(row.capaian_cp)}
                  </td>
                )}
                <td className="align-top whitespace-normal max-w-xs">{row.evaluasi || ''}</td>
                {TINDAK_LANJUT_UNIT.map((unit) => (
                  <td key={`tl-${row.id}-${unit.key}`} className="align-top whitespace-normal max-w-[8rem]">
                    {noteValue(row, 'tindak_lanjut', unit.key)}
                  </td>
                ))}
                {TINDAK_LANJUT_UNIT.map((unit) => (
                  <td key={`us-${row.id}-${unit.key}`} className="align-top whitespace-normal max-w-[8rem]">
                    {noteValue(row, 'usulan', unit.key)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
