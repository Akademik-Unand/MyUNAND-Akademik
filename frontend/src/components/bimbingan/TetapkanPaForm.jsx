import { useMemo } from "react";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { useResourceQuery } from "../../hooks/useResourceQuery";
import {
  dosenFilterUntukMahasiswa,
  dosenLabel,
  mahasiswaLabel,
  unitLabel,
} from "../../helpers/bimbinganPa";

const CANDIDATE_LIMIT = 200;

/**
 * Form penetapan PA satu-satu. Saat `mahasiswa` diisi (alur ganti PA), pilihan
 * mahasiswa dikunci dan hanya dosen yang bisa diubah.
 */
export const TetapkanPaForm = ({ values, onChange, mahasiswa = null }) => {
  const setField = (key) => (event) =>
    onChange({ ...values, [key]: event.target.value });

  const candidatesQuery = useResourceQuery("bimbingan-candidates", {
    params: { limit: CANDIDATE_LIMIT },
    enabled: !mahasiswa,
  });
  const candidateRows = candidatesQuery.data || [];
  const candidateTotal = candidatesQuery.data?.length ?? 0;

  const terpilih =
    mahasiswa ||
    candidateRows.find((row) => row.id === values.mahasiswa_id) ||
    null;

  const filterUnit = useMemo(
    () => dosenFilterUntukMahasiswa(terpilih),
    [terpilih],
  );
  const dosenQuery = useResourceQuery("dosen", {
    params: { limit: 200, ...(filterUnit ? { filter: filterUnit } : {}) },
    enabled: Boolean(terpilih),
  });

  const mahasiswaOptions = candidateRows.map((row) => ({
    value: row.id,
    label: `${mahasiswaLabel(row)} — ${unitLabel(row)}`,
  }));
  const dosenOptions = (dosenQuery.data || []).map((row) => ({
    value: row.id,
    label: dosenLabel(row),
  }));

  return (
    <div className="space-y-3">
      {mahasiswa ? (
        <div className="rounded-box border border-base-300 bg-base-200/50 px-3 py-2">
          <p className="text-xs text-base-content/60">Mahasiswa</p>
          <p className="text-sm font-medium text-base-content">
            {mahasiswaLabel(mahasiswa)}
          </p>
          <p className="text-xs text-base-content/60">{unitLabel(mahasiswa)}</p>
        </div>
      ) : (
        <>
          <Select
            label="Mahasiswa"
            placeholder="Pilih mahasiswa yang belum punya PA"
            options={mahasiswaOptions}
            value={values.mahasiswa_id}
            onChange={setField("mahasiswa_id")}
            disabled={candidatesQuery.isPending}
          />
          <p className="text-xs text-base-content/60">
            {candidatesQuery.isPending
              ? "Memuat mahasiswa tanpa dosen PA..."
              : candidateTotal === 0
                ? "Tidak ada mahasiswa tanpa dosen PA pada unit ini."
                : `${candidateTotal} mahasiswa tanpa dosen PA. Gunakan filter unit bila daftarnya terlalu panjang.`}
          </p>
        </>
      )}

      <Select
        label="Dosen PA"
        placeholder={
          terpilih
            ? "Pilih dosen pembimbing"
            : "Pilih mahasiswa terlebih dahulu"
        }
        options={dosenOptions}
        value={values.dosen_id}
        onChange={setField("dosen_id")}
        disabled={!terpilih || dosenQuery.isPending}
      />
      <p className="text-xs text-base-content/60">
        Dosen harus dari program studi atau departemen yang sama dengan
        mahasiswa. Menetapkan PA baru otomatis menutup bimbingan PA sebelumnya.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          label="Tahun Akademik (opsional)"
          placeholder="2026/2027"
          value={values.tahun_akademik}
          onChange={setField("tahun_akademik")}
        />
      </div>

      <Textarea
        label="Catatan (opsional)"
        rows={2}
        value={values.catatan}
        onChange={setField("catatan")}
      />
    </div>
  );
};
