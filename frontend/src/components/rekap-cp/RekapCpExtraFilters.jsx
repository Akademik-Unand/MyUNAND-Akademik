import { useCallback, useMemo, useState } from 'react';
import { FilterBar } from '../common/FilterBar';
import { ResourceSelect } from '../common/ResourceSelect';
import { Select } from '../ui/Select';
import { kelasDisplayName } from '../../helpers/kelasInfo';

const EMPTY = {
  cp_id: '',
  matakuliah_id: '',
  kelas_id: '',
  transkrip_saja: '',
  pilihan_data: 'persen_target',
  angkatan: '',
};

const ANGKATAN = [
  { value: '2020', label: '2020' },
  { value: '2021', label: '2021' },
  { value: '2022', label: '2022' },
  { value: '2023', label: '2023' },
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
  { value: '2026', label: '2026' },
];

const compact = (obj) =>
  Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== '' && value !== undefined));

export const RekapCpExtraFilters = ({ academicFilter = {}, onApply, onReset }) => {
  const [draft, setDraft] = useState(EMPTY);

  const set = (key) => (e) => setDraft((prev) => ({ ...prev, [key]: e.target.value }));

  const apply = useCallback(() => {
    onApply?.(compact(draft));
  }, [draft, onApply]);

  const reset = useCallback(() => {
    setDraft(EMPTY);
    onReset?.({});
  }, [onReset]);

  const cpParams = useMemo(
    () => (academicFilter.kurikulum_id ? { filter: { kurikulum_id: academicFilter.kurikulum_id } } : {}),
    [academicFilter.kurikulum_id]
  );
  const mkParams = useMemo(
    () => (academicFilter.kurikulum_id ? { filter: { kurikulum_id: academicFilter.kurikulum_id } } : {}),
    [academicFilter.kurikulum_id]
  );
  const kelasParams = useMemo(() => {
    const filter = {};
    if (draft.matakuliah_id) filter.matakuliah_id = draft.matakuliah_id;
    if (academicFilter.semester_id) filter.semester_id = academicFilter.semester_id;
    if (academicFilter.program_studi_id) filter.program_studi_id = academicFilter.program_studi_id;
    return Object.keys(filter).length ? { filter } : {};
  }, [draft.matakuliah_id, academicFilter.semester_id, academicFilter.program_studi_id]);

  const fields = [
    {
      name: 'pilihan_data',
      label: 'Pilihan Data',
      options: [
        { value: 'persen_target', label: 'Persen Mencapai Target' },
        { value: 'nilai_rata', label: 'Nilai rata-rata' },
      ],
      value: draft.pilihan_data,
      onChange: set('pilihan_data'),
    },
    {
      name: 'transkrip_saja',
      label: 'MK Transkrip Saja?',
      options: [
        { value: '', label: 'Tidak' },
        { value: '1', label: 'Ya' },
      ],
      value: draft.transkrip_saja,
      onChange: set('transkrip_saja'),
    },
    {
      name: 'angkatan',
      label: 'Angkatan',
      placeholder: 'Semua angkatan',
      options: ANGKATAN,
      value: draft.angkatan,
      onChange: set('angkatan'),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ResourceSelect
          resource="kurikulum-cp"
          size="sm"
          label="CP"
          placeholder="Semua CP/SCP"
          value={draft.cp_id}
          onChange={set('cp_id')}
          params={cpParams}
          getLabel={(row) => row.nama_cp || row.id}
        />
        <ResourceSelect
          resource="mk-semester"
          size="sm"
          label="MK"
          placeholder="Semua MK"
          value={draft.matakuliah_id}
          onChange={(e) => setDraft((prev) => ({ ...prev, matakuliah_id: e.target.value, kelas_id: '' }))}
          params={mkParams}
          getValue={(row) => row.matakuliah_id}
          getLabel={(row) => row.matakuliah?.nama_resmi || row.matakuliah?.kode_matakuliah || row.id}
        />
        <ResourceSelect
          resource="kelas"
          size="sm"
          label="Kelas"
          placeholder="Semua kelas"
          value={draft.kelas_id}
          onChange={set('kelas_id')}
          params={kelasParams}
          getLabel={(row) => kelasDisplayName(row)}
        />
      </div>
      <FilterBar fields={fields} onApply={apply} onReset={reset} applyLabel="Terapkan filter" />
    </div>
  );
};
