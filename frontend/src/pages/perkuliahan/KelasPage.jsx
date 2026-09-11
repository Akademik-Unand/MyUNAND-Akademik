import { useState } from "react";
import { Plus, Users } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FilterBar } from "../../components/common/FilterBar";
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
import { kelasDisplayName } from "../../helpers/kelasInfo";
import { semesterAkademikLabel } from "../../helpers/semesterProdi";

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
  jumlah_peserta_max: "",
};

export const KelasPage = () => {
  const academic = useAcademicFilter({ keys: FILTER_KEYS });
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
    jumlah_peserta_max: "",
  });
  const [formOpen, setFormOpen] = useState(false);
  const [formValues, setFormValues] = useState(EMPTY_KELAS_FORM);

  // Resolusi semester-prodi & penawaran untuk form tambah kelas (prodi dari konteks navbar).
  const semesterId = formValues.semester_id || activeSemester?.id || "";
  const semesterProdiQuery = useResourceQuery("semester-prodi", {
    params:
      org.prodiId && semesterId
        ? { filter: { program_studi_id: org.prodiId, semester_id: semesterId } }
        : undefined,
    enabled: Boolean(org.prodiId && semesterId),
  });
  const semesterProdi = semesterProdiQuery.data?.[0];
  const offeringQuery = useResourceQuery("penawaran-matakuliah", {
    params: semesterProdi?.id
      ? { filter: { semester_prodi_id: semesterProdi.id } }
      : undefined,
    enabled: Boolean(semesterProdi?.id),
  });
  const offering = offeringQuery.data?.[0];
  const mkOptions = (offering?.matakuliahDitawarkan || []).map((detail) => ({
    value: detail.id,
    label: `${detail.matakuliah?.kode_matakuliah || ""} — ${detail.matakuliah?.nama_resmi || "Mata kuliah"}`,
    matakuliahId: detail.matakuliah_id,
  }));
  const semesterOptions = semesterRows.map((row) => ({
    value: row.id,
    label: `${semesterAkademikLabel(row)}${row.is_aktif ? " (Aktif)" : ""}`,
  }));

  const openCapacity = (row) => {
    setCapacityValues({
      jumlah_peserta_min: row.jumlah_peserta_min ?? "",
      jumlah_peserta_max: row.jumlah_peserta_max ?? "",
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
        jumlah_peserta_max: toNumberOrNull(capacityValues.jumlah_peserta_max),
      },
    });
    setCapacityTarget(null);
  };

  const saveKelas = async (event) => {
    event.preventDefault();
    if (mutations.create.isPending) return;
    await mutations.create.mutateAsync({
      semester_prodi_id: semesterProdi?.id || null,
      matakuliah_id: formValues.matakuliah_id,
      penawaran_matakuliah_id: formValues.penawaran_matakuliah_id || null,
      nama: formValues.nama,
      jumlah_peserta_min: toNumberOrNull(formValues.jumlah_peserta_min),
      jumlah_peserta_max: toNumberOrNull(formValues.jumlah_peserta_max),
    });
    setFormValues(EMPTY_KELAS_FORM);
    setFormOpen(false);
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
      <Card title="Filter">
        <FilterBar
          fields={academic.fields}
          onApply={academic.apply}
          onReset={academic.reset}
          applyDisabled={!academic.canApply}
        />
      </Card>
      <Card title="Daftar Kelas">
        <DataTable
          resource="kelas"
          columns={columns}
          extraFilter={extraFilter}
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
          />
        </form>
      </Modal>
    </div>
  );
};
