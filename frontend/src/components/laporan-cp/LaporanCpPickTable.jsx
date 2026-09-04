import { consecutiveRowSpans } from '../../helpers/tableSpans';
import { formatCapaian, formatPercent, mkSemesterLabel } from '../../helpers/laporanCp';
import { useTableHeadOffset } from '../../hooks/useTableHeadOffset';
import { LaporanCpScpCheckRadios } from './LaporanCpScpCheckRadios';
import { LaporanCpStickyCell } from './LaporanCpStickyCell';

const cpKey = (row) => row.cp_id;
const scpKey = (row) => `${row.cp_id}\u001f${row.scp_id}`;

export const LaporanCpPickTable = ({
  rows = [],
  selected = new Set(),
  onChange,
  readOnly = false,
}) => {
  const { headRef, offset: headOffset } = useTableHeadOffset(rows.length, readOnly);
  const cpSpans = consecutiveRowSpans(rows, cpKey);
  const scpSpans = consecutiveRowSpans(rows, scpKey);

  if (!rows.length) {
    return <p className="text-sm text-base-content/60">Belum ada pemetaan CP–SCP–CPMK pada kurikulum ini.</p>;
  }

  const stickyStyle = { top: headOffset };

  return (
    <div className="max-h-[70vh] overflow-auto">
      <table className="table table-sm w-full">
        <thead ref={headRef} className="sticky top-0 z-30">
          <tr className="text-xs uppercase text-base-content/60">
            <th className="bg-base-100">CP</th>
            <th className="bg-base-100">SCP</th>
            <th className="bg-base-100">CPMK</th>
            <th className="bg-base-100">Mata Kuliah</th>
            <th className="bg-base-100">Sumber Penilaian</th>
            <th className="bg-base-100">Nilai Minimal</th>
            <th className="bg-base-100">Target Mencapai Nilai Minimal</th>
            <th className="bg-base-100">Capaian Target</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => {
            const cpSpan = cpSpans[idx];
            const scpSpan = scpSpans[idx];
            const groupRows = rows.filter((item) => scpKey(item) === scpKey(row));
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
                    {!readOnly && (
                      <LaporanCpScpCheckRadios
                        groupRows={groupRows}
                        selected={selected}
                        onChange={onChange}
                      />
                    )}
                  </LaporanCpStickyCell>
                )}
                <td className="align-top max-w-sm">
                  <p className="font-medium">{row.cpmk_nama}</p>
                  {row.cpmk_deskripsi && (
                    <p className="mt-1 text-xs text-base-content/60 whitespace-normal">{row.cpmk_deskripsi}</p>
                  )}
                </td>
                <td className="align-middle">
                  {readOnly ? (
                    mkSemesterLabel(row)
                  ) : (
                    <label className="flex cursor-pointer items-start gap-2">
                      <input
                        type="checkbox"
                        className="checkbox checkbox-sm checkbox-primary mt-0.5 shrink-0"
                        checked={selected.has(row.id)}
                        onChange={() => {
                          const next = new Set(selected);
                          if (next.has(row.id)) next.delete(row.id);
                          else next.add(row.id);
                          onChange?.(next);
                        }}
                        aria-label={`Pilih ${mkSemesterLabel(row)}`}
                      />
                      <span className="whitespace-normal">{mkSemesterLabel(row)}</span>
                    </label>
                  )}
                </td>
                <td className="align-middle whitespace-normal">{row.sumber_label || '—'}</td>
                <td className="align-middle text-center">{row.nilai_min ?? '—'}</td>
                <td className="align-middle text-center">{formatPercent(row.target_persen)}</td>
                <td className="align-middle text-center">{formatCapaian(row.capaian)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
