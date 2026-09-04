import { useSearchParams } from 'react-router-dom';
import { PillTabs } from '../ui/PillTabs';
import { Card } from '../ui/Card';
import { useCan } from '../../hooks/useCan';
import { KelasNilaiPanel } from './KelasNilaiPanel';
import { KelasEvaluasiPanel } from './KelasEvaluasiPanel';
import { KelasCpmkPanel } from './KelasCpmkPanel';
import { KelasHistoryPanel } from './KelasHistoryPanel';
import { KelasJadwalPanel } from './KelasJadwalPanel';

const HUB_TABS = [
  { id: 'kelas', label: 'Kelas' },
  { id: 'history', label: 'History Upload Nilai' },
  { id: 'jadwal', label: 'Jadwal Ujian' },
];

const PANEL_TABS = [
  { id: 'nilai', label: 'Nilai Peserta Matakuliah' },
  { id: 'evaluasi', label: 'Rangkuman Evaluasi CPMK Kelas' },
  { id: 'cpmk', label: 'Informasi CPMK' },
];

export const KelasHub = ({ kelas, nilaiToolbar = 'link' }) => {
  const [params, setParams] = useSearchParams();
  const can = useCan();
  const hub = params.get('hub') || 'kelas';
  const panel = params.get('panel') || 'nilai';

  const setHub = (id) => {
    const next = new URLSearchParams(params);
    next.set('hub', id);
    if (id !== 'kelas') next.delete('panel');
    setParams(next, { replace: true });
  };

  const setPanel = (id) => {
    const next = new URLSearchParams(params);
    next.set('hub', 'kelas');
    next.set('panel', id);
    setParams(next, { replace: true });
  };

  return (
    <div className="space-y-4">
      <PillTabs items={HUB_TABS} value={hub} onChange={setHub} />

      {hub === 'history' && (
        can('read', 'HistoryUploadNilai') ? (
          <KelasHistoryPanel kelasId={kelas?.id} />
        ) : (
          <Card title="History Upload Nilai">
            <p className="text-sm text-base-content/60">Anda tidak punya akses ke riwayat unggah nilai.</p>
          </Card>
        )
      )}

      {hub === 'jadwal' && <KelasJadwalPanel kelas={kelas} />}

      {hub === 'kelas' && (
        <div className="space-y-4">
          <PillTabs items={PANEL_TABS} value={panel} onChange={setPanel} />
          {panel === 'nilai' && <KelasNilaiPanel kelas={kelas} toolbar={nilaiToolbar} />}
          {panel === 'evaluasi' && (
            can('read', 'EvaluasiCpmk') ? (
              <KelasEvaluasiPanel kelasId={kelas?.id} />
            ) : (
              <Card title="Rangkuman Evaluasi CPMK Kelas">
                <p className="text-sm text-base-content/60">Anda tidak punya akses ke evaluasi CPMK.</p>
              </Card>
            )
          )}
          {panel === 'cpmk' && <KelasCpmkPanel matakuliahId={kelas?.matakuliah_id} />}
        </div>
      )}
    </div>
  );
};
