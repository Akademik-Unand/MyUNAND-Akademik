import { useMemo, useState } from 'react';
import { Settings2 } from 'lucide-react';
import { IconLink } from '../../components/common/IconButton';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { FilterBar } from '../../components/common/FilterBar';
import { DataTable } from '../../components/common/DataTable';
import { MappingMatrix } from '../../components/common/MappingMatrix';
import { Can } from '../../components/auth/Can';
import { PageSkeleton } from '../../components/common/PageSkeleton';
import { useAcademicFilter } from '../../hooks/useAcademicFilter';
import { useResourceQuery } from '../../hooks/useResourceQuery';
import { useCpmkPeriodOpen } from '../../hooks/usePeriodes';
import { buildCpmkScpMatrix } from '../../helpers/cpmkMapping';

const CPMK_ACTIONS = [
  { I: 'create', a: 'Cpmk' },
  { I: 'update', a: 'Cpmk' },
];

const FILTER_KEYS = ['fakultas', 'departemen', 'prodi', 'kurikulum'];

const cpmkCount = (row) => Number(row.cpmk_count ?? row.matakuliah?.cpmk_count ?? 0);

export const CPMKKurikulumPage = () => {
  const academic = useAcademicFilter({ keys: FILTER_KEYS });
  const cpmkOpen = useCpmkPeriodOpen().open;
  const [tab, setTab] = useState('mk');
  const kurikulumId = academic.applied.kurikulumId;
  const extraFilter = academic.extraFilter;

  const cps = useResourceQuery('kurikulum-cp', {
    params: extraFilter ? { filter: extraFilter } : {},
    enabled: Boolean(kurikulumId) && tab === 'mapping',
  });
  const mkLinks = useResourceQuery('mk-semester', {
    params: extraFilter ? { filter: extraFilter } : {},
    enabled: Boolean(kurikulumId) && tab === 'mapping',
  });
  const cpmkRows = useResourceQuery('cpmk-detail', {
    params: extraFilter ? { filter: extraFilter } : {},
    enabled: Boolean(kurikulumId) && tab === 'mapping',
  });

  const matrix = useMemo(() => {
    const built = buildCpmkScpMatrix(cps.data || [], mkLinks.data || [], cpmkRows.data || []);
    if (!kurikulumId) return built;
    return {
      ...built,
      rows: built.rows.map((row) => ({
        ...row,
        to: row.to ? `${row.to}?kurikulum_id=${kurikulumId}` : row.to,
      })),
    };
  }, [cps.data, mkLinks.data, cpmkRows.data, kurikulumId]);

  const columns = [
    { header: '#', render: (_, idx) => idx + 1 },
    {
      key: 'kode_matakuliah',
      header: 'Kode',
      sortable: true,
      cellClassName: 'font-semibold',
      render: (row) => row.matakuliah?.kode_matakuliah || row.kode_matakuliah,
    },
    {
      key: 'jumlah_sks_kurikulum',
      header: 'SKS',
      sortable: true,
      render: (row) => row.matakuliah?.jumlah_sks_kurikulum ?? row.jumlah_sks_kurikulum,
    },
    {
      key: 'nama_resmi',
      header: 'Nama Mata Kuliah',
      sortable: true,
      render: (row) => row.matakuliah?.nama_resmi || row.nama_resmi,
    },
    {
      key: 'cpmk',
      header: 'Jumlah CPMK',
      render: (row) => (
        <span className="badge badge-info badge-sm">{cpmkCount(row)} CPMK</span>
      ),
    },
    {
      header: 'Aksi',
      className: 'text-right',
      cellClassName: 'text-right',
      render: (row) => {
        const mkId = row.matakuliah_id || row.matakuliah?.id;
        if (!mkId || !cpmkOpen) return null;
        return (
          <Can any={CPMK_ACTIONS}>
            <IconLink
              label="Atur CPMK"
              icon={Settings2}
              tone="text-info"
              tooltipPosition="tooltip-left"
              to={`/kurikulum/cpmk/${mkId}${kurikulumId ? `?kurikulum_id=${kurikulumId}` : ''}`}
            />
          </Can>
        );
      },
    },
  ];

  const mappingPending = tab === 'mapping' && kurikulumId && (cps.isPending || mkLinks.isPending || cpmkRows.isPending);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Kelola CPMK"
        subtitle="Kelola capaian pembelajaran mata kuliah (CPMK) pada kurikulum"
        breadcrumbs={[{ label: 'Kurikulum' }, { label: 'CPMK Kurikulum' }]}
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
          Mata Kuliah
        </button>
        <button
          type="button"
          className={`tab ${tab === 'mapping' ? 'tab-active' : ''}`}
          onClick={() => setTab('mapping')}
        >
          Mapping
        </button>
      </div>

      {tab === 'mk' && (
        <Card title="Daftar Mata Kuliah">
          {extraFilter ? (
            <DataTable
              resource="mk-semester"
              tableKey="cpmk_mk_"
              columns={columns}
              extraFilter={extraFilter}
              rowKey={(row) => row.id}
              searchPlaceholder="Cari kode atau nama mata kuliah..."
            />
          ) : (
            <p className="text-sm text-base-content/60">
              Pilih fakultas hingga kurikulum, lalu klik Terapkan untuk melihat mata kuliah dan mengatur CPMK.
            </p>
          )}
        </Card>
      )}

      {tab === 'mapping' && (
        <Card title="Mapping Sub-CPMK ke SCP">
          {!kurikulumId && (
            <p className="text-sm text-base-content/60">
              Pilih kurikulum lalu klik Terapkan untuk menampilkan matriks mapping.
            </p>
          )}
          {mappingPending && <PageSkeleton showFilter={false} cards={1} />}
          {kurikulumId && !mappingPending && <MappingMatrix matrix={matrix} />}
        </Card>
      )}
    </div>
  );
};
