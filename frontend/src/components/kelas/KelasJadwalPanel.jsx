import { Card } from '../ui/Card';
import { kelasJadwalLines } from '../../helpers/kelasInfo';

export const KelasJadwalPanel = ({ kelas }) => {
  const lines = kelasJadwalLines(kelas);

  return (
    <Card title="Jadwal">
      <div className="space-y-4 text-sm">
        <div>
          <p className="text-xs text-base-content/60 mb-1">Jadwal kuliah</p>
          {lines.length ? (
            <ul className="list-disc pl-5">
              {lines.map((line, idx) => (
                <li key={`${line}-${idx}`}>{line}</li>
              ))}
            </ul>
          ) : (
            <p>Belum ada jadwal kuliah.</p>
          )}
        </div>
        <div>
          <p className="text-xs text-base-content/60 mb-1">Jadwal ujian</p>
          <p>Jadwal ujian belum tersedia.</p>
        </div>
      </div>
    </Card>
  );
};
