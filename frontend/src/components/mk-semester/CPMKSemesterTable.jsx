export const CPMKSemesterTable = ({ items = [] }) => {
  const totalBobot = items.reduce(
    (sum, item) => sum + item.rows.reduce((inner, row) => inner + Number(row.bobot || 0), 0),
    0
  );

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr className="text-xs uppercase text-base-content/60">
            <th>Nama</th>
            <th>Deskripsi</th>
            <th>Target Capaian Mahasiswa Minimal</th>
            <th>Target Nilai Minimal</th>
            <th>CPL</th>
            <th>Sumber Nilai</th>
            <th>Bobot</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) =>
            item.rows.map((row, idx) => (
              <tr key={`${item.nama}-${idx}`}>
                {idx === 0 && (
                  <>
                    <td rowSpan={item.rows.length} className="align-top font-semibold">
                      {item.nama}
                    </td>
                    <td rowSpan={item.rows.length} className="align-top max-w-xs">
                      {item.deskripsi}
                    </td>
                    <td rowSpan={item.rows.length} className="align-top">
                      {item.targetCapai}
                    </td>
                    <td rowSpan={item.rows.length} className="align-top">
                      {item.targetNilai}
                    </td>
                  </>
                )}
                <td>
                  {row.cpl && <div className="font-medium">{row.cpl}</div>}
                  {row.cplDesc && <div className="text-xs text-base-content/60">{row.cplDesc}</div>}
                </td>
                <td>{row.sumber}</td>
                <td>{row.bobot}</td>
              </tr>
            ))
          )}
          <tr>
            <td colSpan={6} className="font-medium">
              Total Bobot
            </td>
            <td className="font-medium">{totalBobot}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
