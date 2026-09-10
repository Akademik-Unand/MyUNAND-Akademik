import { useEffect, useMemo, useState } from 'react';
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
import { useOrgContext } from '../../hooks/useOrgContext';

const initialSettings = { fakultas_id: '', departemen_id: '', program_studi_id: '', semester_id: '', semester_prodi_id: '', tanggal_mulai: '', tanggal_selesai: '', kuota_lintas_prodi: 0, akses: 'semua', prodi_tujuan: [] };

export const PenawaranSemesterPage = () => {
  const can = useCan();
  const org = useOrgContext();
  const [settings, setSettings] = useState(initialSettings);
  const [selected, setSelected] = useState([]);
  const [courseQuotas, setCourseQuotas] = useState({});

  useEffect(() => {
    setSettings((current) => ({
      ...current,
      fakultas_id: org.fakultasId,
      departemen_id: org.departemenId,
      program_studi_id: org.prodiId,
      semester_prodi_id: current.program_studi_id === org.prodiId ? current.semester_prodi_id : '',
    }));
    setSelected([]);
    setCourseQuotas({});
  }, [org.fakultasId, org.departemenId, org.prodiId]);

  const semesterProdi = useResourceQuery('semester-prodi', {
    params: settings.program_studi_id && settings.semester_id
      ? { filter: { program_studi_id: settings.program_studi_id, semester_id: settings.semester_id } }
      : undefined,
    enabled: Boolean(settings.program_studi_id && settings.semester_id),
  });
  const courses = useResourceQuery('matakuliah', {
    params: settings.program_studi_id
      ? { filter: { program_studi_id: settings.program_studi_id } }
      : undefined,
    enabled: Boolean(settings.program_studi_id),
  });
  const mutations = useBulkOfferings();
  const resolvedSemesterProdiId = semesterProdi.data?.[0]?.id || '';
  const availableCourses = useMemo(() => coursesForProgram(courses.data, settings.program_studi_id), [courses.data, settings.program_studi_id]);

  const changeSettings = (next) => {
    const academicChanged = next.program_studi_id !== settings.program_studi_id || next.semester_id !== settings.semester_id;
    if (academicChanged) {
      setSelected([]);
      setCourseQuotas({});
    }
    setSettings({ ...next, semester_prodi_id: academicChanged ? '' : next.semester_prodi_id });
  };
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const toggleAll = (checked) => setSelected(checked ? availableCourses.map((row) => row.id) : []);
  const setQuota = (id, value) => setCourseQuotas((current) => ({ ...current, [id]: value }));
  const save = async () => {
    const payloadSettings = { ...settings, semester_prodi_id: resolvedSemesterProdiId };
    await mutations.save.mutateAsync(buildBulkOfferingPayload(payloadSettings, selected, courseQuotas));
    setSelected([]);
    setCourseQuotas({});
  };
  const valid = resolvedSemesterProdiId && settings.tanggal_mulai && settings.tanggal_selesai && selected.length > 0;

  return <div className="space-y-4">
    <PageHeader title="Penawaran MK Semester" subtitle="Buka satu periode penawaran lalu pilih banyak mata kuliah program studi" breadcrumbs={[{ label: 'Semester & Perkuliahan' }, { label: 'Penawaran MK Semester' }]} />
    <Card title="Periode dan Akses Penawaran"><OfferingSettings values={settings} onChange={changeSettings} /></Card>
    <Card title="Pilih Mata Kuliah" actions={can('create', 'PenawaranMatakuliah') && can('sync', 'PenawaranMatakuliah') ? <Button size="sm" className="gap-1" disabled={!valid} isLoading={mutations.save.isPending} onClick={save}><Save size={15}/> Buka {selected.length} Mata Kuliah</Button> : null}>
      <p className="mb-3 text-sm text-base-content/60">Kuota default diterapkan ke semua mata kuliah terpilih dan dapat dioverride satu per satu pada kolom Kuota Lintas.</p>
      <CoursePickerTable courses={availableCourses} selected={selected} quotas={courseQuotas} defaultQuota={settings.kuota_lintas_prodi} onToggle={toggle} onToggleAll={toggleAll} onQuotaChange={setQuota} />
    </Card>
    <Card title="Mata Kuliah yang Sudah Dibuka"><OpenedOfferingsTable filter={resolvedSemesterProdiId ? { semester_prodi_id: resolvedSemesterProdiId } : undefined} canPublish={can('publish', 'PenawaranMatakuliah')} canClose={can('close', 'PenawaranMatakuliah')} onStatus={(id, action) => mutations.status.mutate({ id, action })} /></Card>
  </div>;
};
