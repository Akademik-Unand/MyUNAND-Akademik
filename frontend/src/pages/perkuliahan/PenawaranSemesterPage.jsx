import { useMemo, useState } from 'react';
import { Save } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { OfferingSettings } from '../../components/penawaran/OfferingSettings';
import { CoursePickerTable } from '../../components/penawaran/CoursePickerTable';
import { OpenedOfferingsTable } from '../../components/penawaran/OpenedOfferingsTable';
import { useResourceQuery } from '../../hooks/useResourceQuery';
import { useBulkOfferings } from '../../hooks/useBulkOfferings';
import { useCan } from '../../hooks/useCan';
import { buildBulkOfferingPayload, coursesForProgram } from '../../helpers/courseOffering';

const initialSettings = { semester_prodi_id: '', tanggal_mulai: '', tanggal_selesai: '', kuota_lintas_prodi: 0, akses: 'semua', prodi_tujuan: [] };

export const PenawaranSemesterPage = () => {
  const can = useCan();
  const [settings, setSettings] = useState(initialSettings);
  const [selected, setSelected] = useState([]);
  const semesterProdi = useResourceQuery('semester-prodi');
  const courses = useResourceQuery('matakuliah');
  const mutations = useBulkOfferings();
  const selectedSemesterProdi = semesterProdi.data?.find((row) => row.id === settings.semester_prodi_id);
  const programId = selectedSemesterProdi?.program_studi_id || selectedSemesterProdi?.programStudi?.id;
  const availableCourses = useMemo(() => coursesForProgram(courses.data, programId), [courses.data, programId]);
  const changeSettings = (next) => { if (next.semester_prodi_id !== settings.semester_prodi_id) setSelected([]); setSettings(next); };
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const save = async () => { await mutations.save.mutateAsync(buildBulkOfferingPayload(settings, selected)); setSelected([]); };
  const valid = settings.semester_prodi_id && settings.tanggal_mulai && settings.tanggal_selesai && selected.length > 0;

  return <div className="space-y-4">
    <PageHeader title="Penawaran MK Semester" subtitle="Buka satu periode penawaran lalu pilih banyak mata kuliah program studi" breadcrumbs={[{ label: 'Semester & Perkuliahan' }, { label: 'Penawaran MK Semester' }]} />
    <Card title="Periode dan Akses Penawaran"><OfferingSettings values={settings} onChange={changeSettings} /></Card>
    <Card title="Pilih Mata Kuliah" actions={can('create', 'PenawaranMatakuliah') && can('sync', 'PenawaranMatakuliah') ? <Button size="sm" className="gap-1" disabled={!valid} isLoading={mutations.save.isPending} onClick={save}><Save size={15}/> Buka {selected.length} Mata Kuliah</Button> : null}>
      <p className="mb-3 text-sm text-base-content/60">Hanya mata kuliah milik program studi pada Semester/Program Studi terpilih yang ditampilkan.</p>
      <CoursePickerTable courses={availableCourses} selected={selected} onToggle={toggle} onToggleAll={(checked) => setSelected(checked ? availableCourses.map((row) => row.id) : [])} />
    </Card>
    <Card title="Mata Kuliah yang Sudah Dibuka"><OpenedOfferingsTable filter={settings.semester_prodi_id ? { semester_prodi_id: settings.semester_prodi_id } : undefined} canPublish={can('publish', 'PenawaranMatakuliah')} canClose={can('close', 'PenawaranMatakuliah')} onStatus={(id, action) => mutations.status.mutate({ id, action })} /></Card>
  </div>;
};
