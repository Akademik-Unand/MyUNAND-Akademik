import { Input } from "../ui/Input";
import { ResourceSelect } from "../common/ResourceSelect";
import {
  prodiDepartemenLabel,
  semesterAkademikLabel,
} from "../../helpers/semesterProdi";

export const SemesterProdiForm = ({ values, onChange }) => {
  const set = (key) => (event) =>
    onChange({ ...values, [key]: event.target.value });
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <ResourceSelect
        resource="prodi"
        label="Program Studi *"
        value={values.program_studi_id || ""}
        onChange={set("program_studi_id")}
        placeholder="Pilih program studi"
        getLabel={prodiDepartemenLabel}
        required
      />
      <ResourceSelect
        resource="setting-semester"
        label="Semester"
        value={values.semester_id || ""}
        onChange={set("semester_id")}
        placeholder="Pilih semester"
        getLabel={(row) =>
          `${semesterAkademikLabel(row)}${row.is_aktif ? " (Aktif)" : ""}`
        }
      />
      <label className="flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          className="checkbox checkbox-sm mt-0.5"
          checked={Boolean(values.is_aktif)}
          onChange={(event) =>
            onChange({ ...values, is_aktif: event.target.checked })
          }
        />
        <span className="text-sm">
          Semester berjalan
          <span className="block text-xs text-base-content/60">
            Tandai pasangan semester-prodi ini sebagai periode akademik yang
            sedang aktif.
          </span>
        </span>
      </label>
      <Input
        label="KRS mulai"
        type="date"
        value={values.tanggal_krs_mulai || ""}
        onChange={set("tanggal_krs_mulai")}
      />
      <Input
        label="KRS selesai"
        type="date"
        value={values.tanggal_krs_selesai || ""}
        onChange={set("tanggal_krs_selesai")}
      />
      <Input
        label="Revisi mulai"
        type="date"
        value={values.tanggal_revisi_mulai || ""}
        onChange={set("tanggal_revisi_mulai")}
      />
      <Input
        label="Revisi selesai"
        type="date"
        value={values.tanggal_revisi_selesai || ""}
        onChange={set("tanggal_revisi_selesai")}
      />
      <Input
        label="SKS default"
        type="number"
        min="0"
        value={values.sks_default ?? ""}
        onChange={set("sks_default")}
      />
      <Input
        label="SKS maksimal"
        type="number"
        min="0"
        value={values.sks_maksimal ?? ""}
        onChange={set("sks_maksimal")}
      />
    </div>
  );
};
