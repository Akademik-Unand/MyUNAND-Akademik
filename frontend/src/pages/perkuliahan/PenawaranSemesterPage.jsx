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
import { usePeriodes } from "../../hooks/usePeriodes";
import { findPeriode, isPeriodeOpen, JENIS_PERIODE } from "../../helpers/academicPeriod";
import { PeriodOperationNotice } from "../../components/common/PeriodOperationNotice";

const initialSettings = {
  fakultas_id: "",
  departemen_id: "",
  program_studi_id: "",
  semester_id: "",
  akses: "internal",
  prodi_tujuan: [],
};

export const PenawaranSemesterPage = () => {
  const can = useCan();
  const org = useOrgContext();
  const { semesterRows = [] } = useFilterOptions();
  const periodesQuery = usePeriodes();
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
    }));
    setSelected([]);
    setCourseQuotas({});
  }

  // Default semester = semester aktif (is_aktif) selama belum dipilih manual.
  const semesterId = settings.semester_id || activeSemester?.id || "";
  const krsPeriod = findPeriode(periodesQuery.data, semesterId, JENIS_PERIODE.KRS);
  const krsPeriodOpen = isPeriodeOpen(krsPeriod);
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
  // Satu header dipakai per semester dan prodi penyelenggara; target prodi dan
  // mata kuliah disimpan pada tabel relasinya masing-masing.
  const offeringKeyReady = Boolean(settings.program_studi_id && semesterId);
  const existingQuery = useResourceQuery("penawaran-matakuliah", {
    params: offeringKeyReady
      ? {
          filter: {
            program_studi_id: settings.program_studi_id,
            semester_id: semesterId,
          },
        }
      : undefined,
    enabled: offeringKeyReady,
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
        openedRows.map((row) => [row.matakuliah_id, {
          total: row.jumlah_peserta_max_default ?? 40,
          internal: row.jumlah_peserta_internal_max_default ?? row.jumlah_peserta_max_default ?? 40,
          external: row.kuota_lintas_prodi ?? 0,
        }]),
      ),
    );
  }
  const existingSettingsSignature = existing
    ? `${existing.id}:${existing.akses}:${(existing.prodiTujuan || []).map((row) => row.program_studi_id).sort().join(",")}`
    : "none";
  const [prevSettingsSignature, setPrevSettingsSignature] = useState(null);
  if (prevSettingsSignature !== existingSettingsSignature) {
    setPrevSettingsSignature(existingSettingsSignature);
    if (existing) {
      setSettings((current) => ({
        ...current,
        akses: existing.akses || "semua",
        prodi_tujuan: (existing.prodiTujuan || []).map((row) => row.program_studi_id),
      }));
    }
  }
  const availableCourses = useMemo(
    () => coursesForProgram(courses.data, settings.program_studi_id),
    [courses.data, settings.program_studi_id],
  );

  const changeSettings = (next) => {
    const academicChanged =
      next.program_studi_id !== settings.program_studi_id ||
      next.semester_id !== semesterId;
    if (academicChanged) {
      setSelected([]);
      setCourseQuotas({});
      setSettings({ ...next, akses: "internal", prodi_tujuan: [] });
      return;
    }
    if (next.akses === "internal")
      setCourseQuotas((current) => Object.fromEntries(
        Object.entries(current).map(([id, quotas]) => [id, { ...quotas, external: 0 }]),
      ));
    setSettings(next);
  };
  const toggle = (id) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  const toggleAll = (checked) =>
    setSelected(checked ? availableCourses.map((row) => row.id) : []);
  const setQuota = (id, field, value) =>
    setCourseQuotas((current) => ({
      ...current,
      [id]: { ...(current[id] || {}), [field]: value },
    }));
  const crossEnrollmentEnabled = settings.akses !== "internal";
  const quotasValid = selected.every((id) => {
    const values = courseQuotas[id] || {};
    const total = Number(values.total ?? 40);
    const internal = Number(values.internal ?? total);
    const external = crossEnrollmentEnabled ? Number(values.external ?? 0) : 0;
    return total <= 0 || (internal <= total && external <= total);
  });
  const save = async () => {
    const payloadSettings = {
      ...settings,
      semester_id: semesterId,
      program_studi_id: settings.program_studi_id,
    };
    const payload = buildBulkOfferingPayload(
      payloadSettings,
      selected,
      courseQuotas,
      availableCourses,
    );
    await mutations.save.mutateAsync({ id: existing?.id, payload });
    setSelected([]);
    setCourseQuotas({});
  };
  const valid =
    offeringKeyReady &&
    selected.length > 0 &&
    canEditExisting &&
    quotasValid &&
    (settings.akses !== "terpilih" || settings.prodi_tujuan.length > 0);
  const actionLabel = existing
    ? `Simpan Perubahan Draft (${selected.length} MK)`
    : `Simpan Draft Penawaran (${selected.length} MK)`;

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
      <PeriodOperationNotice
        period={krsPeriod}
        label="publikasi penawaran pada KRS"
        isLoading={periodesQuery.isPending}
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
          Mata kuliah disimpan sebagai draft penawaran untuk prodi penyelenggara.
          Centang opsi lintas prodi hanya jika mahasiswa prodi lain juga boleh mengambilnya;
          total dan kuota setiap kelas menjadi batas aktual; nilai di sini hanya nilai awal.
        </p>
        <p className="mb-3 text-xs text-base-content/60">
          Penawaran dapat disiapkan sebagai draft lebih awal. Mahasiswa baru
          melihat dan dapat mengambil mata kuliah setelah penawaran dipublikasikan
          pada periode KRS yang sesuai.
        </p>
        {!valid && (
          <p className="mb-3 text-sm text-warning" role="status">
            {!settings.program_studi_id
              ? "Pilih program studi penyelenggara terlebih dahulu."
              : !semesterId
                ? "Pilih semester terlebih dahulu."
                : settings.akses === "terpilih" && !settings.prodi_tujuan.length
                  ? "Pilih minimal satu program studi tujuan untuk akses lintas."
                : !selected.length
                    ? "Pilih minimal satu mata kuliah untuk ditawarkan."
                    : !quotasValid
                      ? "Kuota internal dan lintas tidak boleh melebihi kapasitas awal kelas."
                    : "Penawaran ini perlu dibuka kembali sebagai draft sebelum dapat diedit."}
          </p>
        )}
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
          onToggle={toggle}
          onToggleAll={toggleAll}
          onQuotaChange={setQuota}
          showCrossEnrollment={crossEnrollmentEnabled}
        />
        {crossEnrollmentEnabled && (
          <p className="mt-2 text-xs text-base-content/60">
            Nilai lintas 0 menutup kursi lintas pada kelas baru. Kapasitas total
            berlaku untuk gabungan mahasiswa internal dan lintas; kelas dapat
            menyesuaikan batasnya sendiri.
          </p>
        )}
      </Card>
      <Card title="Mata Kuliah yang Sudah Dibuka">
        <OpenedOfferingsTable
          filter={
            offeringKeyReady
              ? {
                  semester_id: semesterId,
                  program_studi_id: settings.program_studi_id,
                }
              : undefined
          }
          canPublish={can("publish", "PenawaranMatakuliah")}
          periodOpen={krsPeriodOpen}
          periodLoading={periodesQuery.isPending}
          periodNotice={periodesQuery.isPending ? null : !krsPeriodOpen ? "Publikasi menunggu periode KRS semester ini dibuka." : null}
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
