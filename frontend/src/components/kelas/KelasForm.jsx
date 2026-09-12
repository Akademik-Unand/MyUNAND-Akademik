import { Select } from "../ui/Select";
import { Input } from "../ui/Input";
import { Badge } from "../ui/Badge";
import { namaKelasBentrok } from "../../helpers/kelasInfo";

const OFFERING_STATUS_LABEL = {
  draft: "Draft — publikasikan agar kelas dapat diambil",
  published: "Published — kelas dapat diambil",
  closed: "Closed — kelas tidak dapat diambil",
};

/**
 * Form pembuatan kelas. Mata kuliah hanya bisa dipilih dari MK yang sudah
 * dibuka di penawaran semester & prodi tersebut (prodi dari konteks navbar).
 */
export const KelasForm = ({
  values,
  onChange,
  semesterOptions = [],
  prodiLabel = "",
  mkOptions = [],
  offeringStatus = null,
  hasOffering = false,
  existingNames = [],
}) => {
  const set = (key) => (event) =>
    onChange({ ...values, [key]: event.target.value });

  const namaBentrok = namaKelasBentrok(values.nama, existingNames);

  const setMk = (detilId) => {
    const detail = mkOptions.find((option) => option.value === detilId);
    onChange({
      ...values,
      penawaran_matakuliah_id: detilId,
      matakuliah_id: detail?.matakuliahId || "",
    });
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="md:col-span-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-base-content/60">Program Studi</span>
          <Badge variant="ghost">
            {prodiLabel || "Pilih program studi di navbar"}
          </Badge>
        </div>
      </div>

      <Select
        label="Semester *"
        placeholder="Pilih semester"
        options={semesterOptions}
        value={values.semester_id || ""}
        onChange={set("semester_id")}
        required
      />

      <Select
        label="Mata Kuliah (dari penawaran) *"
        placeholder={hasOffering ? "Pilih mata kuliah" : "Belum ada MK dibuka"}
        options={mkOptions}
        value={values.penawaran_matakuliah_id || ""}
        onChange={(event) => setMk(event.target.value)}
        disabled={!hasOffering}
        required
      />

      <Input
        label="Nama Kelas *"
        placeholder="mis. A, B, C"
        maxLength={10}
        value={values.nama || ""}
        onChange={set("nama")}
        error={
          namaBentrok
            ? `Kelas "${String(values.nama).trim()}" sudah ada untuk mata kuliah ini. Pakai nama lain.`
            : undefined
        }
        required
      />

      <Input
        label="Kapasitas minimum"
        type="number"
        min="0"
        value={values.jumlah_peserta_min ?? ""}
        onChange={set("jumlah_peserta_min")}
      />

      <Input
        label="Kapasitas maksimum (prodi sendiri)"
        type="number"
        min="0"
        value={values.jumlah_peserta_max ?? ""}
        onChange={set("jumlah_peserta_max")}
      />

      <div className="md:col-span-2 space-y-1">
        {offeringStatus && (
          <p className="text-xs text-base-content/60">
            Penawaran: {OFFERING_STATUS_LABEL[offeringStatus]}
          </p>
        )}
        {existingNames.length > 0 && (
          <p className="text-xs text-base-content/60">
            Nama kelas yang sudah dipakai mata kuliah ini:{" "}
            <span className="font-medium">{existingNames.join(", ")}</span>
          </p>
        )}
        <p className="text-xs text-base-content/60">
          Nama kelas hanya perlu unik di dalam satu mata kuliah — mata kuliah
          lain boleh memakai nama yang sama (mis. "Pemrograman A" dan "Desain
          A").
        </p>
        <p className="text-xs text-base-content/60">
          Kelas dibuat untuk mata kuliah yang sudah dibuka di Penawaran MK
          Semester. Buka MK terlebih dahulu bila belum tersedia. Kapasitas
          maksimum membatasi KRS reguler (prodi sendiri); kosong atau 0 = tanpa
          batas.
        </p>
      </div>
    </div>
  );
};
