import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/common/DataTable";
import { Modal } from "../../components/ui/Modal";
import { FormActions } from "../../components/common/FormActions";
import { IconButton } from "../../components/common/IconButton";
import { Can } from "../../components/auth/Can";
import { useAcademicFilter } from "../../hooks/useAcademicFilter";
import { useResourceMutations } from "../../hooks/useResourceMutations";
import { useResourceQuery } from "../../hooks/useResourceQuery";
import { useOrgContext } from "../../hooks/useOrgContext";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import { buildKelasListColumns } from "../../components/kelas/kelasListColumns";
import { KelasCapacityForm } from "../../components/kelas/KelasCapacityForm";
import { KelasForm } from "../../components/kelas/KelasForm";
import { kelasDisplayName, namaKelasBentrok } from "../../helpers/kelasInfo";
import { semesterAkademikLabel } from "../../helpers/academicLabel";

const FILTER_KEYS = [
  "fakultas",
  "departemen",
  "prodi",
  "kurikulum",
  "semester",
];

const toNumberOrNull = (value) =>
  value === "" || value == null ? null : Number(value);

const EMPTY_KELAS_FORM = {
  semester_id: "",
  matakuliah_id: "",
  penawaran_matakuliah_id: "",
  nama: "",
  jumlah_peserta_min: "",
  jumlah_peserta_internal_max: "",
  jumlah_peserta_lintas_prodi_max: 0,
};

export const KelasPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const contextDetailId = searchParams.get("detailId") || "";
  const contextSemesterId = searchParams.get("semesterId") || "";
  const returnTo = searchParams.get("returnTo") || "";
  const academic = useAcademicFilter({ keys: FILTER_KEYS, applyImmediately: true });
  const extraFilter = academic.extraFilter;
  const mutations = useResourceMutations("kelas", {
    create: "Kelas berhasil ditambahkan.",
    update: "Kapasitas kelas berhasil diperbarui.",
  });
  const org = useOrgContext();
  const { semesterRows = [] } = useFilterOptions();
  const activeSemester = semesterRows.find((row) => row.is_aktif);
  const [capacityTarget, setCapacityTarget] = useState(null);
  const [capacityValues, setCapacityValues] = useState({
    jumlah_peserta_min: "",
    jumlah_peserta_internal_max: "",
    jumlah_peserta_lintas_prodi_max: "",
  });
  const [formOpen, setFormOpen] = useState(false);
  const [contextPrefilled, setContextPrefilled] = useState("");
  const [formValues, setFormValues] = useState(EMPTY_KELAS_FORM);

  // Penawaran untuk form tambah kelas: semester terpilih + prodi dari konteks navbar.
  const semesterId =
    contextSemesterId || formValues.semester_id || activeSemester?.id || "";
  const offeringQuery = useResourceQuery("penawaran-matakuliah", {
    params:
      org.prodiId && semesterId
        ? {
            filter: {
              program_studi_id: org.prodiId,
              semester_id: semesterId,
            },
          }
        : undefined,
    enabled: Boolean(org.prodiId && semesterId),
  });
  const offering = offeringQuery.data?.[0];
  const mkOptions = (offering?.matakuliahDitawarkan || []).map((detail) => ({
    value: detail.id,
    label: `${detail.matakuliah?.kode_matakuliah || ""} — ${detail.matakuliah?.nama_resmi || "Mata kuliah"}`,
    matakuliahId: detail.matakuliah_id,
    jumlahPesertaMaxDefault: detail.jumlah_peserta_max_default ?? 40,
    jumlahPesertaInternalMaxDefault:
      detail.jumlah_peserta_internal_max_default ?? detail.jumlah_peserta_max_default ?? 40,
    kuotaLintasDefault: detail.kuota_lintas_prodi ?? 0,
  }));
  const semesterOptions = semesterRows.map((row) => ({
    value: row.id,
    label: `${semesterAkademikLabel(row)}${row.is_aktif ? " (Aktif)" : ""}`,
  }));

  if (contextDetailId && offering && contextPrefilled !== contextDetailId) {
    const detail = offering.matakuliahDitawarkan?.find(
      (row) => row.id === contextDetailId,
    );
    if (detail) {
      setContextPrefilled(contextDetailId);
      setFormValues({
        ...EMPTY_KELAS_FORM,
        semester_id: contextSemesterId || offering.semester_id,
        matakuliah_id: detail.matakuliah_id,
        penawaran_matakuliah_id: detail.id,
        jumlah_peserta_internal_max:
          detail.jumlah_peserta_internal_max_default ??
          detail.jumlah_peserta_max_default ??
          40,
        jumlah_peserta_lintas_prodi_max: detail.kuota_lintas_prodi ?? 0,
      });
      setFormOpen(true);
    }
  }

  // Nama kelas yang sudah dipakai pada MK × semester × prodi terpilih — satu
  // nama hanya boleh sekali, jadi dicek di klien agar tidak perlu bolak-balik
  // ke server (dan pesannya lebih jelas daripada galat unik dari MySQL).
  const kelasSekelasQuery = useResourceQuery("kelas", {
    params:
      org.prodiId && semesterId && formValues.matakuliah_id
        ? {
            limit: 200,
            filter: {
              semester_id: semesterId,
              program_studi_id: org.prodiId,
              matakuliah_id: formValues.matakuliah_id,
            },
          }
        : undefined,
    enabled: Boolean(org.prodiId && semesterId && formValues.matakuliah_id),
  });
  const namaKelasTerpakai = (kelasSekelasQuery.data || [])
    .map((row) => row.nama)
    .filter(Boolean);

  const openCapacity = (row) => {
    setCapacityValues({
      jumlah_peserta_min: row.jumlah_peserta_min ?? "",
      jumlah_peserta_internal_max: row.jumlah_peserta_internal_max ?? "",
      jumlah_peserta_lintas_prodi_max: row.jumlah_peserta_lintas_prodi_max ?? "",
    });
    setCapacityTarget(row);
  };
  const closeCapacity = () => {
    if (mutations.update.isPending) return;
    setCapacityTarget(null);
  };
  const saveCapacity = async (event) => {
    event.preventDefault();
    if (mutations.update.isPending) return;
    await mutations.update.mutateAsync({
      id: capacityTarget.id,
      payload: {
        jumlah_peserta_min: toNumberOrNull(capacityValues.jumlah_peserta_min),
        jumlah_peserta_internal_max: toNumberOrNull(capacityValues.jumlah_peserta_internal_max),
        jumlah_peserta_lintas_prodi_max: toNumberOrNull(capacityValues.jumlah_peserta_lintas_prodi_max),
      },
    });
    setCapacityTarget(null);
  };

  const saveKelas = async (event) => {
    event.preventDefault();
    if (mutations.create.isPending) return;
    if (namaKelasBentrok(formValues.nama, namaKelasTerpakai)) {
      toast.error(
        `Kelas "${String(formValues.nama).trim()}" sudah ada untuk mata kuliah ini. Pakai nama kelas lain.`,
      );
      return;
    }
    const created = await mutations.create.mutateAsync({
      semester_id: semesterId,
      program_studi_id: org.prodiId,
      matakuliah_id: formValues.matakuliah_id,
      penawaran_matakuliah_id: formValues.penawaran_matakuliah_id || null,
      nama: formValues.nama,
      jumlah_peserta_min: toNumberOrNull(formValues.jumlah_peserta_min),
      jumlah_peserta_internal_max: toNumberOrNull(formValues.jumlah_peserta_internal_max),
      jumlah_peserta_lintas_prodi_max: toNumberOrNull(formValues.jumlah_peserta_lintas_prodi_max),
    });
    await queryClient.invalidateQueries({ queryKey: ["penawaran-matakuliah"] });
    setFormValues(EMPTY_KELAS_FORM);
    setFormOpen(false);
    if (returnTo && created?.id) {
      const next = new URLSearchParams({ hub: "jadwal", returnTo });
      navigate(`/perkuliahan/kelas/${created.id}?${next.toString()}`);
    } else if (returnTo) {
      navigate(returnTo);
    }
  };

  const columns = buildKelasListColumns({
    extraAction: (row) => (
      <Can I="update" a="Kelas">
        <IconButton
          label="Atur kapasitas kelas"
          icon={Users}
          tone="text-primary"
          onClick={() => openCapacity(row)}
        />
      </Can>
    ),
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Daftar Kelas"
        subtitle="Daftar kelas perkuliahan per semester — kapasitas maksimum mengatur pendaftaran mahasiswa prodi sendiri"
        breadcrumbs={[{ label: "Perkuliahan" }, { label: "Kelas" }]}
        action={
          <Can I="create" a="Kelas">
            <Button
              size="sm"
              className="gap-1"
              onClick={() => {
                setFormValues({
                  ...EMPTY_KELAS_FORM,
                  semester_id: activeSemester?.id || "",
                });
                setFormOpen(true);
              }}
            >
              <Plus size={15} /> Tambah Kelas
            </Button>
          </Can>
        }
      />
      <Card title="Daftar Kelas">
        <DataTable
          resource="kelas"
          columns={columns}
          extraFilter={extraFilter}
          dataLocked={academic.locked}
          toolbarFilters={academic.fields}
          onApplyToolbarFilters={academic.apply}
          onResetToolbarFilters={academic.reset}
          toolbarFiltersDisabled={!academic.canApply}
          rowKey={(row) => row.id}
          searchPlaceholder="Cari kelas atau mata kuliah..."
        />
      </Card>

      <Modal
        open={Boolean(capacityTarget)}
        onClose={closeCapacity}
        title="Atur Kapasitas Kelas"
        subtitle={capacityTarget ? kelasDisplayName(capacityTarget) : ""}
        closeOnBackdrop={!mutations.update.isPending}
        footer={
          <FormActions
            onCancel={closeCapacity}
            submitLabel="Simpan"
            isLoading={mutations.update.isPending}
            onSubmitClick={() =>
              document.getElementById("kelas-capacity-form")?.requestSubmit()
            }
          />
        }
      >
        <form id="kelas-capacity-form" onSubmit={saveCapacity}>
          <KelasCapacityForm
            values={capacityValues}
            onChange={setCapacityValues}
          />
        </form>
      </Modal>

      <Modal
        open={formOpen}
        onClose={() => {
          if (mutations.create.isPending) return;
          setFormOpen(false);
        }}
        title="Tambah Kelas"
        subtitle="Buat kelas untuk mata kuliah yang sudah dibuka di penawaran semester ini"
        closeOnBackdrop={!mutations.create.isPending}
        footer={
          <FormActions
            onCancel={() => setFormOpen(false)}
            submitLabel="Simpan"
            isLoading={mutations.create.isPending}
            onSubmitClick={() =>
              document.getElementById("kelas-form")?.requestSubmit()
            }
          />
        }
      >
        <form id="kelas-form" onSubmit={saveKelas}>
          <KelasForm
            values={formValues}
            onChange={setFormValues}
            semesterOptions={semesterOptions}
            prodiLabel={org.label}
            mkOptions={mkOptions}
            offeringStatus={offering?.status || null}
            hasOffering={Boolean(offering)}
            existingNames={namaKelasTerpakai}
          />
        </form>
      </Modal>
    </div>
  );
};
