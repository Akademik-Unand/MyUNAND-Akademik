import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/ui/Card";
import { FormActions } from "../../components/common/FormActions";
import { PageSkeleton } from "../../components/common/PageSkeleton";
import { ProdiForm } from "../../components/master/ProdiForm";
import { useCan } from "../../hooks/useCan";
import { useResourceMutations } from "../../hooks/useResourceMutations";
import { useResourceItem } from "../../hooks/useResourceQuery";
import { updateProdiSks } from "../../services/api";

const empty = {
  kode_prodi: "",
  jenjang_akademik_id: "",
  model_kurikulum_id: "",
  universitas_id: "",
  fakultas_id: "",
  departemen_id: "",
  nama_resmi: "",
  nama_singkat: "",
  sks_default: "",
  sks_maksimal: "",
};

export const ProdiFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const existing = useResourceItem("prodi", id);
  const [values, setValues] = useState(empty);
  const isEdit = Boolean(id);
  const mutations = useResourceMutations("prodi");
  const can = useCan();
  // Kuota SKS kebijakan universitas — admin unit boleh mengubah profil prodi,
  // tetapi bukan angka SKS-nya.
  const canEditSks = can("update-sks", "ProgramStudi");
  const saving = mutations.create.isPending || mutations.update.isPending;

  useEffect(() => {
    if (existing.data) {
      setValues({
        ...empty,
        ...existing.data,
        jenjang_akademik_id: existing.data.jenjang_akademik_id || "",
        model_kurikulum_id: existing.data.model_kurikulum_id || "",
        universitas_id: existing.data.universitas_id || "",
        fakultas_id: existing.data.fakultas_id || "",
        departemen_id: existing.data.departemen_id || "",
        sks_default: existing.data.sks_default ?? "",
        sks_maksimal: existing.data.sks_maksimal ?? "",
      });
    }
  }, [existing.data]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;
    const payload = {
      kode_prodi: values.kode_prodi,
      jenjang_akademik_id: values.jenjang_akademik_id || null,
      model_kurikulum_id: values.model_kurikulum_id || null,
      universitas_id: values.universitas_id || null,
      fakultas_id: values.fakultas_id,
      departemen_id: values.departemen_id || null,
      nama_resmi: values.nama_resmi,
      nama_singkat: values.nama_singkat,
    };

    let targetId = id;
    if (isEdit) {
      await mutations.update.mutateAsync({ id, payload });
    } else {
      const created = await mutations.create.mutateAsync(payload);
      targetId = created?.id;
    }

    if (canEditSks && targetId) {
      try {
        await updateProdiSks(targetId, {
          sks_default:
            values.sks_default === "" ? null : Number(values.sks_default),
          sks_maksimal:
            values.sks_maksimal === "" ? null : Number(values.sks_maksimal),
        });
        await mutations.invalidate();
      } catch (err) {
        toast.error(err.message || "Gagal memperbarui kuota SKS.");
      }
    }

    navigate("/master/prodi");
  };

  if (isEdit && existing.isPending) return <PageSkeleton cards={1} />;

  return (
    <div className="space-y-4">
      <PageHeader
        title={isEdit ? "Ubah Program Studi" : "Tambah Program Studi"}
        subtitle={
          isEdit
            ? `Mengubah ${values.nama_resmi || ""}`
            : "Lengkapi data program studi"
        }
        breadcrumbs={[
          { label: "Master Data" },
          { label: "Program Studi", path: "/master/prodi" },
          { label: isEdit ? "Ubah" : "Tambah" },
        ]}
      />
      <Card title={isEdit ? "Form Ubah" : "Form Tambah"}>
        <form onSubmit={handleSubmit}>
          <ProdiForm
            values={values}
            onChange={setValues}
            canEditSks={canEditSks}
          />
          <div className="mt-4">
            <FormActions
              onCancel={() => navigate("/master/prodi")}
              submitLabel={isEdit ? "Perbarui" : "Simpan"}
              isLoading={saving}
            />
          </div>
        </form>
      </Card>
    </div>
  );
};
