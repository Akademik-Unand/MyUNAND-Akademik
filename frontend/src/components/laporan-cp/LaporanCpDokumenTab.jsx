import { FileText, ExternalLink } from 'lucide-react';

export const LaporanCpDokumenTab = ({ dokumen = [] }) => {
  if (!dokumen.length) {
    return <p className="text-sm text-base-content/60">Belum ada dokumen evaluasi.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr className="text-xs uppercase text-base-content/60">
            <th className="bg-base-100">Nama Dokumen</th>
            <th className="bg-base-100">Jenis</th>
            <th className="bg-base-100">Keterangan</th>
            <th className="bg-base-100">Berkas</th>
          </tr>
        </thead>
        <tbody>
          {dokumen.map((row) => (
            <tr key={row.id}>
              <td className="font-medium">
                <span className="inline-flex items-center gap-1.5">
                  <FileText size={14} className="text-base-content/60" />
                  {row.nama}
                </span>
              </td>
              <td>{row.jenis_nama || '—'}</td>
              <td className="max-w-xs whitespace-normal">{row.keterangan || '—'}</td>
              <td>
                {row.file_path ? (
                  <a
                    href={row.file_path}
                    target="_blank"
                    rel="noreferrer"
                    className="link link-hover inline-flex items-center gap-1"
                  >
                    {row.file_path}
                    <ExternalLink size={12} />
                  </a>
                ) : (
                  '—'
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};