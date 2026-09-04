import { useMemo, useState } from 'react';

const matchesSearch = (row, search) => {
  if (!search) return true;
  const q = search.toLowerCase();
  return String(row.niu || '').toLowerCase().includes(q) || String(row.nama || '').toLowerCase().includes(q);
};

const formatScore = (value) => {
  if (value === null || value === undefined || value === '') return '';
  return value;
};

export const NilaiPesertaMatrix = ({ data }) => {
  const [search, setSearch] = useState('');
  const groups = data?.groups || [];
  const peserta = useMemo(
    () => (data?.peserta || []).filter((row) => matchesSearch(row, search)),
    [data?.peserta, search]
  );
  const colSpan = groups.reduce((sum, group) => sum + (group.sumber?.length || 0), 0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-medium">Nilai Peserta Kelas</h4>
        <input
          type="search"
          className="input input-sm w-64 max-w-full"
          placeholder="Cari NIM atau nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="table table-xs table-pin-rows w-full border-collapse">
          <thead>
            <tr className="text-xs uppercase text-base-content/60">
              <th rowSpan={groups.length ? 3 : 1} className="align-bottom">#</th>
              <th rowSpan={groups.length ? 3 : 1} className="align-bottom">NIM</th>
              <th rowSpan={groups.length ? 3 : 1} className="align-bottom">Nama Mahasiswa</th>
              {groups.map((group) => (
                <th key={group.id} colSpan={group.sumber.length} className="text-center">
                  {group.nama}
                </th>
              ))}
              <th rowSpan={groups.length ? 3 : 1} className="align-bottom bg-info/10">
                Nilai Angka
              </th>
              <th rowSpan={groups.length ? 3 : 1} className="align-bottom bg-info/10">
                Nilai Huruf
              </th>
            </tr>
            {groups.length > 0 && (
              <>
                <tr className="text-xs text-base-content/60">
                  {groups.map((group) => (
                    <th key={`${group.id}-scp`} colSpan={group.sumber.length} className="text-center font-normal">
                      {group.scp_label}
                    </th>
                  ))}
                </tr>
                <tr className="text-xs text-base-content/60">
                  {groups.flatMap((group) =>
                    group.sumber.map((item) => (
                      <th key={item.id} className="text-center font-normal min-w-16">
                        <div>{item.nama}</div>
                        <div className="text-info">{item.bobot}</div>
                      </th>
                    ))
                  )}
                </tr>
              </>
            )}
          </thead>
          <tbody>
            {peserta.length === 0 ? (
              <tr>
                <td colSpan={5 + colSpan} className="text-center text-base-content/60 py-8">
                  Tidak ada peserta.
                </td>
              </tr>
            ) : (
              peserta.map((row, idx) => (
                <tr key={row.krs_detil_id}>
                  <td>{idx + 1}</td>
                  <td className="whitespace-nowrap">{row.niu || '—'}</td>
                  <td className="whitespace-nowrap font-medium">{row.nama || '—'}</td>
                  {groups.flatMap((group) =>
                    group.sumber.map((item) => (
                      <td key={item.id} className="text-center">
                        {formatScore(row.nilai?.[item.id])}
                      </td>
                    ))
                  )}
                  <td className="text-center bg-info/10">{row.nilai_angka ?? ''}</td>
                  <td className="text-center bg-info/10">{row.nilai_huruf ?? ''}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
