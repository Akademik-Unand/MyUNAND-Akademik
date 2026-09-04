export const CPMKSemesterTable = ({ items = [] }) => {
  const totalBobot = items.reduce(
    (sum, item) =>
      sum + (item.sumberPenilaian || []).reduce((inner, row) => inner + Number(row.bobot || 0), 0),
    0
  );

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr className="text-xs uppercase text-base-content/60">
            <th>Nama</th>
            <th>Deskripsi</th>
            <th>Sumber Nilai</th>
            <th>Bobot</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const sumber = item.sumberPenilaian?.length ? item.sumberPenilaian : [{ id: 'empty', nama_sumber_penilaian: '—', bobot: 0 }];
            return sumber.map((row, idx) => (
              <tr key={`${item.id}-${row.id}`}>
                {idx === 0 && (
                  <>
                    <td rowSpan={sumber.length} className="align-top font-semibold">
                      {item.nama_cpmk}
                    </td>
                    <td rowSpan={sumber.length} className="align-top max-w-xs">
                      {item.deskripsi}
                    </td>
                  </>
                )}
                <td>{row.nama_sumber_penilaian}</td>
                <td>{row.bobot}</td>
              </tr>
            ));
          })}
          <tr>
            <td colSpan={3} className="font-medium">
              Total Bobot
            </td>
            <td className="font-medium">{totalBobot}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
