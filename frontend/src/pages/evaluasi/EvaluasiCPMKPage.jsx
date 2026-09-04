import { useState } from 'react';
import Chart from 'react-apexcharts';
import { MKSemesterLayout } from '../../components/mk-semester/MKSemesterLayout';
import { Card } from '../../components/ui/Card';
import { DataTable } from '../../components/common/DataTable';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { useResourceQuery } from '../../hooks/useResourceQuery';
import { evaluasiCapaianOptions, evaluasiCapaianSeries } from '../../helpers/evaluasiChart';

export const EvaluasiCPMKPage = () => {
  const [semester, setSemester] = useState('');
  const [tab, setTab] = useState('rangkuman');
  const query = useResourceQuery('evaluasi-cpmk');

  if (query.isPending) return <PageSkeleton showFilter={false} tableCols={8} />;

  const rows = query.data ?? [];
  const chartOptions = evaluasiCapaianOptions(rows.map((row) => row.cpmk?.nama_cpmk || row.cpmk_id));
  const chartSeries = evaluasiCapaianSeries(
    rows.map((row) => ({ capaianTarget: row.capaian_persen || 0 }))
  );

  const nilaiColumns = [
    { header: '#', render: (_, idx) => idx + 1 },
    { key: 'krs_detil_id', header: 'KRS Detil', sortable: true },
    {
      key: 'sumber_penilaian_id',
      header: 'Sumber',
      render: (row) => row.sumberPenilaian?.nama_sumber_penilaian || '—',
    },
    { key: 'nilai', header: 'Nilai', sortable: true },
  ];

  return (
    <MKSemesterLayout semester={semester} onSemesterChange={setSemester}>
      <Card title="Evaluasi CPMK Semester">
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
                  <th>Target nilai min</th>
                  <th>Target persen lulus</th>
                  <th>Capaian</th>
                  <th>Rata-rata</th>
                  <th>Jumlah lulus</th>
                  <th>Analisis</th>
                  <th>Tindak lanjut</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td className="font-medium">{row.cpmk?.nama_cpmk || row.cpmk_id}</td>
                    <td>{row.target_nilai_min}</td>
                    <td>{row.target_persen_lulus}</td>
                    <td>{row.capaian_persen}</td>
                    <td>{row.rata_rata}</td>
                    <td>{row.jumlah_lulus}</td>
                    <td>{row.analisis || '—'}</td>
                    <td>{row.tindak_lanjut || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'grafik' && (
          <div>
            <h3 className="mb-3 text-sm font-medium">Capaian Target CPMK dalam Grafik</h3>
            {rows.length ? (
              <Chart options={chartOptions} series={chartSeries} type="bar" height={320} />
            ) : (
              <p className="text-sm text-base-content/60">Belum ada data evaluasi.</p>
            )}
          </div>
        )}

        {tab === 'nilai' && (
          <DataTable
            resource="evaluasi-nilai"
            tableKey="evn_"
            columns={nilaiColumns}
            rowKey={(row) => row.id}
            searchPlaceholder="Cari nilai..."
          />
        )}
      </Card>
    </MKSemesterLayout>
  );
};
