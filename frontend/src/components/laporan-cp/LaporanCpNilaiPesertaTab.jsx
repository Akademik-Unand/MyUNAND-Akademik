const colSpanOf = (group) => group.sub.reduce((total, sub) => total + sub.sumber.length, 0);

export const LaporanCpNilaiPesertaTab = ({ nilai }) => {
  const groups = nilai?.groups || [];
  const columns = nilai?.columns || [];
  const rows = nilai?.rows || [];

  if (!rows.length) {
    return <p className="text-sm text-base-content/60">Belum ada peserta terdaftar.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-xs w-full min-w-[70rem]">
        <thead>
          <tr className="text-xs uppercase text-base-content/60">
            <th rowSpan={3} className="bg-base-100 align-bottom">#</th>
            <th rowSpan={3} className="bg-base-100 align-bottom">Kelas</th>
            <th rowSpan={3} className="bg-base-100 align-bottom">NIM</th>
            <th rowSpan={3} className="bg-base-100 align-bottom">Nama Mahasiswa</th>
            {groups.map((group) => (
              <th
                key={group.id}
                colSpan={colSpanOf(group)}
                className="bg-base-100 text-center"
              >
                {group.nama}
              </th>
            ))}
            <th rowSpan={3} className="bg-base-100 align-bottom">Nilai Angka</th>
            <th rowSpan={3} className="bg-base-100 align-bottom">Nilai Huruf</th>
          </tr>
          <tr className="text-xs uppercase text-base-content/60">
            {groups.map((group) =>
              group.sub.map((sub) => (
                <th
                  key={`${group.id}-${sub.id}`}
                  colSpan={sub.sumber.length}
                  className="bg-base-100 text-center font-normal"
                >
                  {sub.nama}
                </th>
              ))
            )}
          </tr>
          <tr className="text-xs uppercase text-base-content/60">
            {columns.map((column) => (
              <th
                key={column.id}
                className="bg-base-100 text-center font-normal"
                title={`${column.cpmk_nama} · bobot ${column.bobot}`}
              >
                <span className="block">{column.nama}</span>
                <span className="block font-light">{column.bobot}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr key={row.krs_detil_id}>
              <td className="text-base-content/60">{idx + 1}</td>
              <td>{row.kelas_nama || '—'}</td>
              <td>{row.niu || '—'}</td>
              <td className="font-medium">{row.nama || '—'}</td>
              {columns.map((column) => (
                <td key={column.id} className="text-center">
                  {row.nilai?.[column.id] ?? '—'}
                </td>
              ))}
              <td className="text-center font-semibold">{row.nilai_angka ?? '—'}</td>
              <td className="text-center font-medium">{row.nilai_huruf ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};