import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings2 } from 'lucide-react';
import { IconLink } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable } from '../../components/common/DataTable';
import { useFilterOptions } from '../../hooks/useFilterOptions';

export const MKSemesterPage = () => {
  const [tab, setTab] = useState('mk');
  const [kurikulumId, setKurikulumId] = useState('');
  const filters = useFilterOptions();

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    {
      key: 'matakuliah_id',
      header: 'Kode',
      sortable: true,
      cellClassName: 'font-semibold',
      render: (row) => row.matakuliah?.kode_matakuliah,
    },
    {
      key: 'nama',
      header: 'Nama Mata Kuliah',
      render: (row) => row.matakuliah?.nama_resmi,
    },
    {
      key: 'sks',
      header: 'SKS',
      render: (row) => row.matakuliah?.jumlah_sks_kurikulum,
    },
    {
      key: 'status',
      header: 'Transkrip',
      sortable: true,
      render: (row) =>
        row.status === 'transkrip' ? (
          <span className="badge badge-success badge-sm">Ya</span>
        ) : (
          <span className="badge badge-ghost badge-sm">Tidak</span>
        ),
    },
    {
      header: 'Dokumen Evaluasi',
      render: (row) => (
        <Link to={`/perkuliahan/mk-semester/${row.matakuliah_id}/dokumen`} className="btn btn-xs btn-ghost">
          Dokumen
        </Link>
      ),
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => (
        <IconLink
          label="Kelola MK"
          icon={Settings2}
          tone="text-info"
          tooltipPosition="tooltip-left"
          to={`/perkuliahan/mk-semester/${row.matakuliah_id}`}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kelola MK Semester"
        subtitle="Kelola mata kuliah per semester dan evaluasi capaian pembelajaran"
        breadcrumbs={[{ label: 'Semester & Perkuliahan' }, { label: 'MK Semester' }]}
        action={
          tab === 'transkrip' ? (
            <Link to="/perkuliahan/mk-semester/transkrip/atur">
              <Button size="sm">Atur</Button>
            </Link>
          ) : null
        }
      />

      <Card>
        <FilterBar
          fields={[
            { label: 'Departemen', placeholder: 'Pilih Departemen', options: filters.departemen },
            { label: 'Prodi', placeholder: 'Pilih', options: filters.prodi },
            {
              label: 'Kurikulum',
              placeholder: 'Pilih Kurikulum',
              options: filters.kurikulum,
              value: kurikulumId,
              onChange: (e) => setKurikulumId(e.target.value),
            },
            { label: 'Semester', placeholder: 'Pilih Semester', options: filters.semester },
          ]}
        />
      </Card>

      <div className="tabs tabs-box w-fit bg-base-200">
        <button type="button" className={`tab ${tab === 'mk' ? 'tab-active' : ''}`} onClick={() => setTab('mk')}>
          MK Semester
        </button>
        <button
          type="button"
          className={`tab ${tab === 'transkrip' ? 'tab-active' : ''}`}
          onClick={() => setTab('transkrip')}
        >
          MK Transkrip
        </button>
      </div>

      {tab === 'mk' && (
        <Card title="Daftar MK Semester">
          <DataTable
            resource="mk-semester"
            tableKey="mk_"
            columns={columns}
            extraFilter={kurikulumId ? { kurikulum_id: kurikulumId } : undefined}
            rowKey={(row) => row.id}
            searchPlaceholder="Cari kode atau nama mata kuliah..."
          />
        </Card>
      )}
      {tab === 'transkrip' && (
        <Card title="MK Transkrip CP">
          <DataTable
            resource="mk-transkrip"
            tableKey="tr_"
            columns={columns}
            extraFilter={{ status: 'transkrip', ...(kurikulumId ? { kurikulum_id: kurikulumId } : {}) }}
            rowKey={(row) => row.id}
            searchPlaceholder="Cari mata kuliah transkrip..."
          />
        </Card>
      )}
    </div>
  );
};
