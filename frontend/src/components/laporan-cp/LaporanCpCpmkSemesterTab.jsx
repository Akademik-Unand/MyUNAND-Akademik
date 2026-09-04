import { sumberLabel } from '../../helpers/laporanCpMatakuliah';

const targetPct = (value) => (value === null || value === undefined ? '—' : `${value} %`);

export const LaporanCpCpmkSemesterTab = ({ cpmk = [] }) => {
  if (!cpmk.length) {
    return <p className="text-sm text-base-content/60">Belum ada CPMK untuk mata kuliah ini.</p>;
  }

  const totalBobot = cpmk.reduce((total, row) => total + (row.bobot_total || 0), 0);

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr className="text-xs uppercase text-base-content/60">
            <th className="bg-base-100">Nama</th>
            <th className="bg-base-100">Deskripsi</th>
            <th className="bg-base-100 text-center">Target Mencapai Nilai Minimal</th>
            <th className="bg-base-100 text-center">Target Nilai Minimal</th>
            <th className="bg-base-100">CPL</th>
            <th className="bg-base-100">Sumber Nilai</th>
            <th className="bg-base-100 text-center">Bobot</th>
          </tr>
        </thead>
        <tbody>
          {cpmk.map((row) => (
            <tr key={row.id}>
              <td className="align-top font-medium">{row.nama_cpmk}</td>
              <td className="align-top max-w-md whitespace-normal">{row.deskripsi || '—'}</td>
              <td className="align-middle text-center">{targetPct(row.target_persen)}</td>
              <td className="align-middle text-center">
                {row.nilai_min == null ? '—' : `${row.nilai_min}/100`}
              </td>
              <td className="align-top whitespace-normal">
                {row.cpl.length ? (
                  <ul className="space-y-1">
                    {row.cpl.map((item) => (
                      <li key={item.kode}>
                        <span className="font-medium">{item.kode}</span>
                        {item.deskripsi && (
                          <span className="text-xs text-base-content/60"> — {item.deskripsi}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  '—'
                )}
              </td>
              <td className="align-top whitespace-normal">
                {row.sumber.length ? row.sumber.map(sumberLabel).join(', ') : '—'}
              </td>
              <td className="align-middle text-center">{row.bobot_total ?? 0}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="font-semibold">
            <td colSpan={6} className="text-right">Total Bobot</td>
            <td className="text-center">{totalBobot}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};