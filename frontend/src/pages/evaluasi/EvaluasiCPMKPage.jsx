import { useState } from 'react';
import Chart from 'react-apexcharts';
import { Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { MKSemesterLayout } from '../../components/mk-semester/MKSemesterLayout';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { FormActions } from '../../components/common/FormActions';
import { IconButton } from '../../components/common/IconButton';
import { DataTable } from '../../components/common/DataTable';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { useResourceQuery } from '../../hooks/useResourceQuery';
import { useBusyAction } from '../../hooks/useBusyAction';
import { evaluasiCapaianOptions, evaluasiCapaianSeries } from '../../helpers/evaluasiChart';
import { FILTER_SEMESTER } from '../../constants/mockData';

const LEVELS = [
  { key: 'tt', label: 'TT' },
  { key: 'prodi', label: 'Prodi' },
  { key: 'departemen', label: 'Departemen' },
  { key: 'fakultas', label: 'Fakultas' },
];

export const EvaluasiCPMKPage = () => {
  const [semester, setSemester] = useState(FILTER_SEMESTER[0]);
  const [tab, setTab] = useState('rangkuman');
  const [compare, setCompare] = useState('Genap 2023');
  const [note, setNote] = useState(null);
  const query = useResourceQuery('evaluasi-cpmk');
  const { busy, runMock } = useBusyAction();

  if (query.isPending) return <PageSkeleton showFilter={false} tableCols={8} />;

  const rows = query.data ?? [];
  const chartOptions = evaluasiCapaianOptions(rows.map((row) => row.cpmk));
  const chartSeries = evaluasiCapaianSeries(rows);

  const nilaiColumns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'bp', header: 'BP', sortable: true },
    { key: 'nama', header: 'Nama', sortable: true },
    { key: 'cpmk1', header: 'CPMK 1', sortable: true },
    { key: 'cpmk2', header: 'CPMK 2', sortable: true },
    { key: 'cpmk3', header: 'CPMK 3', sortable: true },
    { key: 'akhir', header: 'Nilai Akhir', sortable: true },
    { key: 'huruf', header: 'Huruf', sortable: true },
  ];

  const saveNote = (e) => {
    e.preventDefault();
    return runMock(() => {
      toast.success('Catatan tindak lanjut disimpan', {
        description: 'Perubahan hanya disimpan di sesi ini (data mock).',
      });
      setNote(null);
    });
  };

  return (
    <MKSemesterLayout active="evaluasi" semester={semester} onSemesterChange={setSemester}>
      <Card
        title="Evaluasi CPMK Semester"
        actions={
          <Select
            label="Lihat semester lainnya"
            size="xs"
            className="w-44"
            value={compare}
            onChange={(e) => setCompare(e.target.value)}
            options={FILTER_SEMESTER.map((item) => ({ value: item, label: item }))}
          />
        }
      >
        <div className="tabs tabs-box mb-4 w-fit bg-base-200">
          <button type="button" className={`tab ${tab === 'rangkuman' ? 'tab-active' : ''}`} onClick={() => setTab('rangkuman')}>
            Rangkuman Evaluasi CPMK
          </button>
          <button type="button" className={`tab ${tab === 'grafik' ? 'tab-active' : ''}`} onClick={() => setTab('grafik')}>
            Grafik Rangkuman Evaluasi
          </button>
          <button type="button" className={`tab ${tab === 'nilai' ? 'tab-active' : ''}`} onClick={() => setTab('nilai')}>
            Nilai Peserta Matakuliah
          </button>
        </div>

        {tab === 'rangkuman' && (
          <div className="overflow-x-auto">
            <table className="table table-xs w-full">
              <thead>
                <tr className="text-xs uppercase text-base-content/60">
                  <th>CPMK</th>
                  <th>CPL</th>
                  <th>Target Mencapai Nilai Minimal</th>
                  <th>Target Nilai Minimal</th>
                  <th>Nilai Masuk</th>
                  <th>Rata-rata</th>
                  <th>Jumlah Lulus</th>
                  <th>Capaian Target</th>
                  <th>Evaluasi</th>
                  <th colSpan={4}>Tindak Lanjut Sudah Dilakukan</th>
                  <th colSpan={4}>Usulan Tindak Lanjut Sistemik</th>
                </tr>
                <tr className="text-xs uppercase text-base-content/60">
                  {Array.from({ length: 9 }).map((_, idx) => (
                    <th key={idx}></th>
                  ))}
                  {LEVELS.map((level) => (
                    <th key={`tl-${level.key}`}>{level.label}</th>
                  ))}
                  {LEVELS.map((level) => (
                    <th key={`us-${level.key}`}>{level.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="font-medium">{row.cpmk}</td>
                    <td>{row.cpl}</td>
                    <td>{row.targetCapai}</td>
                    <td>{row.targetNilai}</td>
                    <td>{row.nilaiMasuk}</td>
                    <td>{row.rataRata}</td>
                    <td>{row.jumlahLulus}</td>
                    <td>{row.capaianTarget}</td>
                    <td>
                      <span className={`badge badge-sm ${row.evaluasi === 'Tercapai' ? 'badge-success' : 'badge-error'}`}>
                        {row.evaluasi}
                      </span>
                    </td>
                    {LEVELS.map((level) => (
                      <td key={`tl-${row.id}-${level.key}`}>
                        <div className="flex items-start gap-1">
                          <span className="max-w-24 truncate text-xs">{row.tindakLanjut[level.key] || '—'}</span>
                          <IconButton
                            label={`Ubah tindak lanjut ${level.label}`}
                            icon={Pencil}
                            onClick={() =>
                              setNote({
                                title: `Tindak Lanjut Sudah Dilakukan ${level.label} ${row.cpmk}`,
                                group: 'tindakLanjut',
                                field: level.key,
                                value: row.tindakLanjut[level.key],
                              })
                            }
                          />
                        </div>
                      </td>
                    ))}
                    {LEVELS.map((level) => (
                      <td key={`us-${row.id}-${level.key}`}>
                        <div className="flex items-start gap-1">
                          <span className="max-w-24 truncate text-xs">{row.usulan[level.key] || '—'}</span>
                          <IconButton
                            label={`Ubah usulan ${level.label}`}
                            icon={Pencil}
                            onClick={() =>
                              setNote({
                                title: `Usulan Tindak Lanjut Sistemik ${level.label} ${row.cpmk}`,
                                group: 'usulan',
                                field: level.key,
                                value: row.usulan[level.key],
                              })
                            }
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-sm font-medium text-primary">Rangkuman Evaluasi CPMK Sebelumnya ({compare})</p>
          </div>
        )}

        {tab === 'grafik' && (
          <div>
            <h3 className="mb-3 text-sm font-medium">Capaian Target CPMK dalam Grafik</h3>
            <Chart options={chartOptions} series={chartSeries} type="bar" height={320} />
          </div>
        )}

        {tab === 'nilai' && (
          <DataTable
            resource="evaluasi-nilai"
            tableKey="evn_"
            columns={nilaiColumns}
            rowKey={(row) => row.bp}
            searchPlaceholder="Cari mahasiswa..."
          />
        )}
      </Card>

      <Modal
        open={Boolean(note)}
        onClose={() => setNote(null)}
        title={note?.title}
        closeOnBackdrop={!busy}
        footer={
          <FormActions
            onCancel={() => setNote(null)}
            isLoading={busy}
            onSubmitClick={() => document.getElementById('evaluasi-note-form')?.requestSubmit()}
          />
        }
      >
        <form id="evaluasi-note-form" onSubmit={saveNote}>
          <Textarea
            label="Catatan"
            rows={4}
            value={note?.value || ''}
            onChange={(e) => setNote((prev) => ({ ...prev, value: e.target.value }))}
          />
        </form>
      </Modal>
    </MKSemesterLayout>
  );
};
