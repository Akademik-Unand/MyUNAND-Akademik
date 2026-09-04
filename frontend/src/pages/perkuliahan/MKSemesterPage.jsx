import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings2 } from 'lucide-react';
import { IconLink } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable } from '../../components/common/DataTable';
import { Can } from '../../components/auth/Can';
import { useAcademicFilter } from '../../hooks/useAcademicFilter';

const FILTER_KEYS = ['fakultas', 'departemen', 'prodi', 'kurikulum', 'semester'];

export const MKSemesterPage = () => {
  const [tab, setTab] = useState('mk');
  const academic = useAcademicFilter({ keys: FILTER_KEYS });
  const extraFilter = academic.extraFilter;

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
        <Can I="read" a="DokumenEvaluasi">
          <Link to={`/perkuliahan/mk-semester/${row.matakuliah_id}/dokumen`} className="btn btn-xs btn-ghost">
            Dokumen
          </Link>
        </Can>
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
            <Can I="update" a="MatakuliahKurikulum">
              <Link to="/perkuliahan/mk-semester/transkrip/atur">
                <Button size="sm">Atur</Button>
              </Link>
            </Can>
          ) : null
        }
      />

      <Card title="Filter">
        <FilterBar
          fields={academic.fields}
          onApply={academic.apply}
          onReset={academic.reset}
          applyDisabled={!academic.canApply}
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
            extraFilter={extraFilter}
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
            extraFilter={{ status: 'transkrip', ...(extraFilter || {}) }}
            rowKey={(row) => row.id}
            searchPlaceholder="Cari mata kuliah transkrip..."
          />
        </Card>
      )}
    </div>
  );
};
