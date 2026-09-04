import { Link, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { LAPORAN_CP, LAPORAN_MATRIX } from '../../constants/mockData';
import { DetailList } from '../../components/common/DetailList';

export const LaporanCPViewPage = () => {
  const { id } = useParams();
  const laporan = LAPORAN_CP.find((l) => l.id === id) || LAPORAN_CP[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title={laporan.nama}
        subtitle="Pratinjau laporan capaian pembelajaran (mock)"
        breadcrumbs={[
          { label: 'Semester & Perkuliahan' },
          { label: 'Laporan CP', path: '/perkuliahan/laporan-cp' },
          { label: 'Lihat' },
        ]}
      />

      <Card title="Informasi Laporan">
        <DetailList
          items={[
            { label: 'Nama', value: laporan.nama },
            { label: 'Keterangan', value: laporan.keterangan || '—' },
            { label: 'Dibuat oleh', value: laporan.dibuatOleh },
            { label: 'Terakhir diubah', value: laporan.terakhir },
            { label: 'Kurikulum', value: laporan.kurikulum },
            { label: 'Semester', value: laporan.semester },
          ]}
        />
      </Card>

      <Card title="Matriks Capaian">
        <div className="overflow-x-auto">
          <table className="table table-sm w-full">
            <thead>
              <tr>
                <th>CP</th>
                <th>SCP</th>
                <th>CPMK</th>
                <th>Mata Kuliah</th>
                <th>Sumber</th>
                <th>Nilai Min</th>
                <th>Target</th>
                <th>Dipilih</th>
              </tr>
            </thead>
            <tbody>
              {LAPORAN_MATRIX.map((row, idx) => (
                <tr key={idx}>
                  <td>{row.cp}</td>
                  <td>{row.scp}</td>
                  <td>{row.cpmk}</td>
                  <td>{row.mk}</td>
                  <td className="text-xs">{row.sumber}</td>
                  <td>{row.nilaiMin}</td>
                  <td>{row.target}</td>
                  <td>{row.checked ? 'Ya' : 'Tidak'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Link to="/perkuliahan/laporan-cp" className="btn btn-ghost btn-sm mt-4">
          Kembali
        </Link>
      </Card>
    </div>
  );
};
