import { useMemo, useState } from "react";
import { Save } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { OfferingSettings } from "../../components/penawaran/OfferingSettings";
import { CoursePickerTable } from "../../components/penawaran/CoursePickerTable";
import { OpenedOfferingsTable } from "../../components/penawaran/OpenedOfferingsTable";
import { ConfirmDeleteModal } from "../../components/common/ConfirmDeleteModal";
import { useResourceQuery } from "../../hooks/useResourceQuery";
import { useResourceMutations } from "../../hooks/useResourceMutations";
import { useBulkOfferings } from "../../hooks/useBulkOfferings";
import { useCan } from "../../hooks/useCan";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import {
  buildBulkOfferingPayload,
  coursesForProgram,
} from "../../helpers/courseOffering";
import { useOrgContext } from "../../hooks/useOrgContext";

const initialSettings = {
  fakultas_id: "",
  departemen_id: "",
  program_studi_id: "",
  semester_id: "",
  semester_prodi_id: "",
  kuota_lintas_prodi: 0,
  akses: "semua",
  prodi_tujuan: [],
};

export const PenawaranSemesterPage = () => {
  const can = useCan();
  const org = useOrgContext();
  const { semesterRows = [] } = useFilterOptions();
  const activeSemester = semesterRows.find((row) => row.is_aktif);
  const [settings, setSettings] = useState(initialSettings);
  const [selected, setSelected] = useState([]);
  const [courseQuotas, setCourseQuotas] = useState({});

  // Sinkronkan filter organisasi (navbar) ke settings saat render, bukan di
  // useEffect — pola resmi React untuk menyesuaikan state saat prop berubah.
  const [prevOrg, setPrevOrg] = useState(null);
  if (
    prevOrg !== org &&
    (prevOrg == null ||
      prevOrg.fakultasId !== org.fakultasId ||
      prevOrg.departemenId !== org.departemenId ||
      prevOrg.prodiId !== org.prodiId)
  ) {
    setPrevOrg(org);
    setSettings((current) => ({
      ...current,
      fakultas_id: org.fakultasId,
      departemen_id: org.departemenId,
      program_studi_id: org.prodiId,
      semester_prodi_id:
        current.program_studi_id === org.prodiId
          ? current.semester_prodi_id
          : "",
    }));
    setSelected([]);
    setCourseQuotas({});
  }

  // Default semester = semester aktif (is_aktif) selama belum dipilih manual.
  const semesterId = settings.semester_id || activeSemester?.id || "";
  const semesterProdi = useResourceQuery("semester-prodi", {
    params:
      settings.program_studi_id && semesterId
        ? {
            filter: {
              program_studi_id: settings.program_studi_id,
              semester_id: semesterId,
            },
          }
        : undefined,
    enabled: Boolean(settings.program_studi_id && semesterId),
  });
  const courses = useResourceQuery("matakuliah", {
    params: settings.program_studi_id
      ? { filter: { program_studi_id: settings.program_studi_id } }
      : undefined,
    enabled: Boolean(settings.program_studi_id),
  });
  const mutations = useBulkOfferings();
  const penawaranMutations = useResourceMutations("penawaran-matakuliah", {
    remove: "Penawaran berhasil dihapus.",
  });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const resolvedSemesterProdiId = semesterProdi.data?.[0]?.id || "";
  const existingQuery = useResourceQuery("penawaran-matakuliah", {
    params: resolvedSemesterProdiId
      ? { filter: { semester_prodi_id: resolvedSemesterProdiId } }
      : undefined,
    enabled: Boolean(resolvedSemesterProdiId),
  });
  const existing = existingQuery.data?.[0] || null;
  const canEditExisting = !existing || existing.status === "draft";
  // Sinkronkan pilihan di pemilih MK dengan MK yang sudah dibuka di penawaran,
  // supaya "Perbarui" mengedit daftar yang ada (cek 2 lagi = nambah 2, bukan
  // mengganti 2 yang lama diam-diam).
  const openedRows = existing?.matakuliahDitawarkan || [];
  const openedSignature = openedRows
    .map((row) => row.matakuliah_id)
    .sort()
    .join(",");
  const [prevOpenedSignature, setPrevOpenedSignature] = useState(null);
  if (prevOpenedSignature !== openedSignature) {
    setPrevOpenedSignature(openedSignature);
    setSelected(openedRows.map((row) => row.matakuliah_id));
    setCourseQuotas(
      Object.fromEntries(
        openedRows
          .filter((row) => row.kuota_lintas_prodi != null)
          .map((row) => [row.matakuliah_id, row.kuota_lintas_prodi]),
      ),
    );
  }
  const availableCourses = useMemo(
    () => coursesForProgram(courses.data, settings.program_studi_id),
    [courses.data, settings.program_studi_id],
  );

  const changeSettings = (next) => {
    const academicChanged =
      next.program_studi_id !== settings.program_studi_id ||
      next.semester_id !== settings.semester_id;
    if (academicChanged) {
      setSelected([]);
      setCourseQuotas({});
    }
    setSettings({
      ...next,
      semester_prodi_id: academicChanged ? "" : next.semester_prodi_id,
    });
  };
  const toggle = (id) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  const toggleAll = (checked) =>
    setSelected(checked ? availableCourses.map((row) => row.id) : []);
  const setQuota = (id, value) =>
    setCourseQuotas((current) => ({ ...current, [id]: value }));
  const save = async () => {
    const payloadSettings = {
      ...settings,
      semester_prodi_id: resolvedSemesterProdiId,
    };
    const payload = buildBulkOfferingPayload(
      payloadSettings,
      selected,
      courseQuotas,
      availableCourses,
    );
    if (existing) {
      await mutations.sync.mutateAsync({ id: existing.id, payload });
    } else {
      await mutations.save.mutateAsync(payload);
    }
    setSelected([]);
    setCourseQuotas({});
  };
  const valid =
    resolvedSemesterProdiId && selected.length > 0 && canEditExisting;
  const actionLabel = existing
    ? `Perbarui ${selected.length} Mata Kuliah`
    : `Buka ${selected.length} Mata Kuliah`;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Penawaran MK Semester"
        subtitle="Pilih program studi dan semester, lalu buka banyak mata kuliah sekaligus"
        breadcrumbs={[
          { label: "Perkuliahan" },
          { label: "Penawaran MK Semester" },
        ]}
      />
      <Card title="Pengaturan Penawaran">
        <OfferingSettings
          values={{ ...settings, semester_id: semesterId }}
          onChange={changeSettings}
        />
      </Card>
      <Card
        title="Pilih Mata Kuliah"
        actions={
          can("create", "PenawaranMatakuliah") &&
          can("sync", "PenawaranMatakuliah") ? (
            <Button
              size="sm"
              className="gap-1"
              disabled={!valid}
              isLoading={mutations.save.isPending || mutations.sync.isPending}
              onClick={save}
            >
              <Save size={15} /> {actionLabel}
            </Button>
          ) : null
        }
      >
        <p className="mb-3 text-sm text-base-content/60">
          Kapasitas lintas prodi adalah jatah tambahan di luar kapasitas kelas
          (untuk mahasiswa prodi sendiri). Nilai di pengaturan menjadi default
          untuk semua mata kuliah terpilih dan dapat dioverride satu per satu
          pada kolom Kapasitas Lintas. Mata kuliah berprasyarat tidak dapat
          diberi kapasitas lintas (selalu 0).
        </p>
        {existing && existing.status !== "draft" && (
          <p className="mb-3 rounded-box bg-base-200/60 px-3 py-2 text-sm text-base-content/70">
            Penawaran semester ini sudah berstatus{" "}
            <strong>{existing.status}</strong>. Daftar mata kuliah hanya bisa
            diubah selama penawaran masih <strong>draft</strong> (sebelum
            dipublikasikan).
          </p>
        )}
        <CoursePickerTable
          courses={availableCourses}
          selected={selected}
          quotas={courseQuotas}
          defaultQuota={settings.kuota_lintas_prodi}
          onToggle={toggle}
          onToggleAll={toggleAll}
          onQuotaChange={setQuota}
        />
      </Card>
      <Card title="Mata Kuliah yang Sudah Dibuka">
        <OpenedOfferingsTable
          filter={
            resolvedSemesterProdiId
              ? { semester_prodi_id: resolvedSemesterProdiId }
              : undefined
          }
          canPublish={can("publish", "PenawaranMatakuliah")}
          canClose={can("close", "PenawaranMatakuliah")}
          canDelete={can("delete", "PenawaranMatakuliah")}
          onDelete={setDeleteTarget}
          onStatus={(id, action) => mutations.status.mutate({ id, action })}
        />
      </Card>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Penawaran"
        message={
          deleteTarget
            ? `Yakin ingin menghapus penawaran semester ini beserta ${deleteTarget.matakuliahDitawarkan?.length || 0} mata kuliahnya? Hanya penawaran draft yang dapat dihapus.`
            : ""
        }
        onConfirm={async () => {
          await penawaranMutations.remove.mutateAsync(deleteTarget.id);
          setDeleteTarget(null);
        }}
        isLoading={penawaranMutations.remove.isPending}
      />
    </div>
  );
};
