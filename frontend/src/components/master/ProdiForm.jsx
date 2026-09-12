import { Input } from "../ui/Input";
import { ResourceSelect } from "../common/ResourceSelect";

export const ProdiForm = ({ values, onChange, canEditSks = false }) => {
  const set = (key) => (e) => onChange({ ...values, [key]: e.target.value });
  return (
    <div className="space-y-3 max-w-2xl">
      <Input
        label="Kode Prodi *"
        value={values.kode_prodi || ""}
        onChange={set("kode_prodi")}
        maxLength={15}
        required
      />
      <ResourceSelect
        resource="jenjang-akademik"
        label="Jenjang"
        value={values.jenjang_akademik_id || ""}
        onChange={set("jenjang_akademik_id")}
        placeholder="Pilih jenjang"
        getLabel={(row) => row.nama_jenjang || row.kode_jenjang}
      />
      <ResourceSelect
        resource="model-kurikulum"
        label="Model Kurikulum"
        value={values.model_kurikulum_id || ""}
        onChange={set("model_kurikulum_id")}
        placeholder="Pilih model"
        getLabel={(row) => row.nama_model || row.id}
      />
      <ResourceSelect
        resource="universitas"
        label="Universitas"
        value={values.universitas_id || ""}
        onChange={set("universitas_id")}
        placeholder="Pilih universitas"
      />
      <ResourceSelect
        resource="fakultas"
        label="Fakultas *"
        value={values.fakultas_id || ""}
        onChange={set("fakultas_id")}
        placeholder="Pilih fakultas"
        required
      />
      <ResourceSelect
        resource="departemen"
        label="Departemen"
        value={values.departemen_id || ""}
        onChange={set("departemen_id")}
        placeholder="Pilih departemen"
      />
      <Input
        label="Nama Resmi *"
        value={values.nama_resmi || ""}
        onChange={set("nama_resmi")}
        required
      />
      <Input
        label="Nama Singkat"
        value={values.nama_singkat || ""}
        onChange={set("nama_singkat")}
      />
      {canEditSks ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Input
            label="SKS Default"
            type="number"
            min="0"
            max="60"
            value={values.sks_default ?? ""}
            onChange={set("sks_default")}
          />
          <Input
            label="SKS Maksimal"
            type="number"
            min="0"
            max="60"
            value={values.sks_maksimal ?? ""}
            onChange={set("sks_maksimal")}
          />
          <p className="text-xs text-base-content/60 sm:col-span-2">
            Kuota SKS kebijakan universitas (aturan rektor) dan berlaku untuk
            semua semester prodi ini — batas pengambilan KRS mahasiswa. Jendela
            KRS diatur global di menu Periode.
          </p>
        </div>
      ) : (
        <div className="rounded-box border border-base-300 bg-base-200/40 p-3">
          <div className="text-xs uppercase tracking-wide text-base-content/60">
            Kuota SKS (kebijakan universitas)
          </div>
          <p className="mt-1 text-sm">
            Default {values.sks_default ?? "—"} SKS · Maksimal{" "}
            {values.sks_maksimal ?? "—"} SKS
          </p>
          <p className="mt-1 text-xs text-base-content/60">
            Hanya admin universitas yang dapat mengubah kuota SKS.
          </p>
        </div>
      )}
    </div>
  );
};
