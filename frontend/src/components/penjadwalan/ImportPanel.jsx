import { useState } from "react";
import { toast } from "sonner";
import { DataTable } from "../common/DataTable";
import { useSchedulingMutation } from "../../hooks/usePenjadwalan";
import { schedulingAction } from "../../services/penjadwalan.service";
import { downloadSchedule } from "../../helpers/schedulingDownload";
import { Can } from "../auth/Can";
export function ImportPanel({ scenario }) {
  const [file, setFile] = useState(null),
    [mapping, setMapping] = useState({}),
    [preview, setPreview] = useState(null);
  const run = useSchedulingMutation(({ action, body }) =>
    schedulingAction(scenario.id, action, {
      revision: scenario.revision,
      ...body,
    }),
  );
  const read = async (e) => {
    const f = e.target.files[0];
    setPreview(null);
    if (!f) {
      setFile(null);
      return;
    }
    if (f.size > 7000000) {
      toast.error("Maksimal ukuran berkas 7 MB");
      setFile(null);
      return;
    }
    const format = f.name.toLowerCase().endsWith(".xlsx") ? "xlsx" : "csv";
    const content =
      format === "csv"
        ? await f.text()
        : btoa(
            Array.from(new Uint8Array(await f.arrayBuffer()), (b) =>
              String.fromCharCode(b),
            ).join(""),
          );
    setFile({ format, content });
  };
  return (
    <section className="space-y-4">
      <p>
        Unduh template untuk mendapatkan ID sesi yang sesuai. Impor hanya
        mengubah jadwal acuan pada draf. Penempatan acuan yang melanggar aturan
        tetap ditandai untuk diperbaiki saat simulasi.
      </p>
      <div className="flex gap-2 flex-wrap">
        <button
          className="btn btn-sm"
          onClick={() => downloadSchedule(scenario.id, "csv", true)}
        >
          Template CSV
        </button>
        <button
          className="btn btn-sm"
          onClick={() => downloadSchedule(scenario.id, "xlsx", true)}
        >
          Template Excel
        </button>
      </div>
      <Can I="update" a="Penjadwalan">
        <input
          type="file"
          className="file-input w-full"
          accept=".csv,.xlsx"
          onChange={read}
        />
        <details className="collapse collapse-arrow border border-base-300">
          <summary className="collapse-title">
            Pemetaan kolom berkas lama
          </summary>
          <div className="collapse-content grid gap-2 md:grid-cols-3">
            {[
              "session_id",
              "ruang_id",
              "hari",
              "jam_mulai",
              "jam_selesai",
              "frekuensi",
              "kode_matakuliah",
              "nama_kelas",
              "kode_prodi",
              "nomor_sesi",
              "kode_ruang",
              "kode_gedung",
            ].map((key) => (
              <label key={key} className="fieldset">
                <span>{key}</span>
                <input
                  className="input"
                  placeholder={key}
                  value={mapping[key] || ""}
                  onChange={(e) => {
                    setMapping({ ...mapping, [key]: e.target.value });
                    setPreview(null);
                  }}
                />
              </label>
            ))}
          </div>
        </details>
        <p className="text-sm">
          Pemetaan menentukan nama kolom sumber. Gunakan ID dari template, atau
          kode mata kuliah + nama kelas + nomor sesi dan kode gedung + kode
          ruang. Isi kode prodi jika nama kelas ambigu.
        </p>
        <button
          className="btn"
          disabled={!file || run.isPending}
          onClick={async () => {
            const value = await run
              .mutateAsync({
                action: "import/preview",
                body: {
                  ...file,
                  mapping: Object.fromEntries(
                    Object.entries(mapping).filter(([, v]) => v),
                  ),
                },
              })
              .catch(() => null);
            if (value) setPreview(value);
          }}
        >
          Pratinjau impor
        </button>
        {preview && (
          <>
            <div
              className={`alert ${preview.can_commit ? "alert-info" : "alert-error"}`}
            >
              {preview.baseline.length} baris terbaca; {preview.errors.length}{" "}
              kesalahan; {preview.warnings.length} peringatan aturan.
            </div>
            <DataTable
              rows={[...preview.errors, ...preview.warnings]}
              tableKey="import_"
              columns={[
                {
                  key: "row",
                  header: "Baris / sesi",
                  render: (r) => r.row || r.session_id,
                },
                { key: "reason", header: "Temuan" },
              ]}
              rowKey={(r, i) => i}
              searchableFields={["reason", "session_id"]}
              emptyText="Tidak ada kesalahan atau peringatan."
            />
            <button
              className="btn btn-primary"
              disabled={!preview.can_commit || run.isPending}
              onClick={() =>
                run.mutate({
                  action: "import/commit",
                  body: { baseline: preview.baseline },
                })
              }
            >
              Simpan sebagai acuan
            </button>
            {!preview.can_commit && (
              <p className="text-error text-sm">
                Perbaiki semua kesalahan berkas sebelum menyimpan.
              </p>
            )}
          </>
        )}
      </Can>
    </section>
  );
}
