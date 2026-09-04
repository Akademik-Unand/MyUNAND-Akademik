import { Link } from 'react-router-dom';

export const MappingMatrix = ({ matrix }) => {
  const flatHeaders = (matrix.headers || []).flatMap((h) =>
    (h.pis || []).map((pi) => ({ so: h.so, pi, key: `${h.so}|${pi}` }))
  );

  return (
    <div className="overflow-x-auto">
      <table className="table table-xs border border-base-300">
        <thead>
          <tr className="text-center">
            <th rowSpan={2} className="align-middle">#</th>
            <th rowSpan={2} className="align-middle">Kode</th>
            <th rowSpan={2} className="align-middle">Mata Kuliah</th>
            <th rowSpan={2} className="align-middle">SKS</th>
            {(matrix.headers || []).map((h) => (
              <th key={h.so} colSpan={Math.max(h.pis?.length || 0, 1)} className="text-center">
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
          {(matrix.rows || []).map((row, idx) => (
            <tr key={row.kode || idx}>
              <td>{idx + 1}</td>
              <td className="font-semibold whitespace-nowrap">
                {row.to ? (
                  <Link to={row.to} className="link link-hover">
                    {row.kode}
                  </Link>
                ) : (
                  row.kode
                )}
              </td>
              <td className="whitespace-nowrap">{row.nama}</td>
              <td>{row.sks ?? '—'}</td>
              {flatHeaders.map((h) => {
                const items = row.cells?.[h.key] || [];
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
          {!(matrix.rows || []).length && (
            <tr>
              <td colSpan={4 + flatHeaders.length} className="text-sm text-base-content/60">
                Belum ada data mapping.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
