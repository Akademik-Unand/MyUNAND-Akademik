const TINDAK_LANJUT_UNIT = [
  { key: 'team_teaching', label: 'TT' },
  { key: 'prodi', label: 'Prodi' },
  { key: 'jurusan', label: 'Departemen' },
  { key: 'fakultas', label: 'Fakultas' },
];

const pct = (value) => (value === null || value === undefined ? '—' : `${value} %`);

export const LaporanCpRangkumanTab = ({ evaluasi = [], semesterLabel }) => {
  if (!evaluasi.length) {
    return <p className="text-sm text-base-content/60">Belum ada data nilai untuk dihitung.</p>;
  }

  return (
    <div>
      <h3 className="mb-3 text-sm font-medium">
        Rangkuman Evaluasi CPMK{semesterLabel ? ` Semester ${semesterLabel}` : ''}
      </h3>
      <div className="overflow-x-auto">
        <table className="table table-xs w-full min-w-[80rem]">
          <thead>
            <tr className="text-xs uppercase text-base-content/60">
              <th rowSpan={2} className="bg-base-100 align-bottom">CPMK</th>
              <th rowSpan={2} className="bg-base-100 align-bottom">CPL</th>
              <th rowSpan={2} className="bg-base-100 align-bottom">Target Mencapai Nilai Minimal</th>
              <th rowSpan={2} className="bg-base-100 align-bottom">Target Nilai Minimal</th>
              <th rowSpan={2} className="bg-base-100 align-bottom">Nilai Masuk</th>
              <th rowSpan={2} className="bg-base-100 align-bottom">Rata-rata</th>
              <th rowSpan={2} className="bg-base-100 align-bottom">Jumlah Lulus</th>
              <th rowSpan={2} className="bg-base-100 align-bottom">Capaian Target</th>
              <th rowSpan={2} className="bg-base-100 align-bottom">Evaluasi</th>
              <th colSpan={4} className="bg-base-100 text-center">Tindak Lanjut Sudah Dilakukan</th>
              <th colSpan={4} className="bg-base-100 text-center">Usulan Tindak Lanjut Sistemik</th>
            </tr>
            <tr className="text-xs uppercase text-base-content/60">
              {TINDAK_LANJUT_UNIT.map((unit) => (
                <th key={`tl-${unit.key}`} className="bg-base-100 font-normal normal-case">{unit.label}</th>
              ))}
              {TINDAK_LANJUT_UNIT.map((unit) => (
                <th key={`us-${unit.key}`} className="bg-base-100 font-normal normal-case">{unit.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {evaluasi.map((row) => (
              <tr key={row.cpmk_id}>
                <td className="font-medium">{row.cpmk_nama || row.cpmk_id}</td>
                <td className="whitespace-normal">{row.cpl?.length ? row.cpl.join(', ') : '—'}</td>
                <td className="text-center">{pct(row.target_persen_lulus)}</td>
                <td className="text-center">
                  {row.target_nilai_min == null ? '—' : `${row.target_nilai_min}/100`}
                </td>
                <td className="text-center">
                  {row.nilai_masuk ?? 0}/{row.jumlah_peserta ?? 0}
                </td>
                <td className="text-center">{row.rata_rata ?? '—'}</td>
                <td className="text-center">
                  {row.jumlah_lulus ?? 0}/{row.jumlah_peserta ?? 0}
                </td>
                <td className="text-center">{pct(row.capaian_persen)}</td>
                <td className="align-top max-w-[10rem] whitespace-normal">{row.evaluasi || ''}</td>
                {TINDAK_LANJUT_UNIT.map((unit) => (
                  <td key={`tl-${row.cpmk_id}-${unit.key}`} className="align-top max-w-[8rem] whitespace-normal">
                    {row.tindak_lanjut?.[unit.key] || ''}
                  </td>
                ))}
                {TINDAK_LANJUT_UNIT.map((unit) => (
                  <td key={`us-${row.cpmk_id}-${unit.key}`} className="align-top max-w-[8rem] whitespace-normal">
                    {row.usulan?.[unit.key] || ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};