export const MappingMatrix = ({ matrix }) => {
  const flatHeaders = matrix.headers.flatMap((h) => h.pis.map((pi) => ({ so: h.so, pi, key: `${h.so}|${pi}` })));

  return (
    <div className="overflow-x-auto">
      <table className="table table-xs border border-base-300">
        <thead>
          <tr className="text-center">
            <th rowSpan={2} className="align-middle">Kode</th>
            <th rowSpan={2} className="align-middle">Mata Kuliah</th>
            {matrix.headers.map((h) => (
              <th key={h.so} colSpan={h.pis.length} className="text-center">
                {h.so}
              </th>
            ))}
          </tr>
          <tr className="text-center">
            {flatHeaders.map((h) => (
              <th key={h.key}>{h.pi}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.rows.map((row) => (
            <tr key={row.kode}>
              <td className="font-semibold whitespace-nowrap">{row.kode}</td>
              <td className="whitespace-nowrap">{row.nama}</td>
              {flatHeaders.map((h) => {
                const items = row.cells[h.key] || [];
                return (
                  <td
                    key={h.key}
                    className={items.length ? 'bg-success text-success-content text-xs' : 'bg-base-200'}
                  >
                    {items.map((c) => (
                      <div key={c}>{c}</div>
                    ))}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
