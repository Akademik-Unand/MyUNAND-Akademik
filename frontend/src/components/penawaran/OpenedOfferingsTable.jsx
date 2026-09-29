import { Link } from "react-router-dom";
import { ExternalLink, Trash2 } from "lucide-react";
import { DataTable } from "../common/DataTable";
import { Button } from "../ui/Button";
import { IconButton } from "../common/IconButton";
import { useResourceQuery } from "../../hooks/useResourceQuery";

const offeringPublishIssues = (offering) =>
  (offering.matakuliahDitawarkan || []).flatMap((detail) => {
    const code = detail.matakuliah?.kode_matakuliah || detail.matakuliah?.nama_resmi || "Mata kuliah";
    if (!detail.kelas?.length) return [`${code}: kelas belum tersedia.`];
    return detail.kelas.flatMap((kelas) => {
      const reasons = [];
      if (!(kelas.jadwalKelas || []).some((item) => item.hari && item.jam_mulai && item.jam_selesai))
        reasons.push(`${code}, kelas ${kelas.nama}: jadwal perkuliahan belum dibuat.`);
      if (!(kelas.dosenKelas || []).length)
        reasons.push(`${code}, kelas ${kelas.nama}: dosen pengampu belum ditambahkan.`);
      return reasons;
    });
  });

/**
 * Menampilkan satu baris PER MATA KULIAH dari semua penawaran yang dibuka.
 * Status dan Aksi berlaku di level penawaran, jadi digabung (rowspan) per
 * penawaran supaya tidak berulang di tiap baris mata kuliah.
 */
export const OpenedOfferingsTable = ({
  filter,
  onStatus,
  canPublish = false,
  periodOpen = true,
  periodLoading = false,
  periodNotice,
  canClose = false,
  canDelete = false,
  onDelete,
}) => {
  const { data = [] } = useResourceQuery("penawaran-matakuliah", {
    params: filter ? { filter } : undefined,
    enabled: Boolean(filter),
  });

  const rows = data.flatMap((offering) =>
    (offering.matakuliahDitawarkan || []).map((detail) => ({
      penawaran_id: offering.id,
      penawaran: offering,
      status: offering.status || "draft",
      nama:
        detail.matakuliah?.nama_resmi ||
        detail.matakuliah?.kode_matakuliah ||
        "—",
      kode: detail.matakuliah?.kode_matakuliah || "—",
      kuotaInternal: detail.jumlah_peserta_internal_max_default ?? 40,
      kuotaLintas: offering.akses === "internal" ? null : detail.kuota_lintas_prodi ?? 0,
      kapasitasTotal: Number(detail.jumlah_peserta_internal_max_default ?? detail.jumlah_peserta_max_default ?? 40) + Number(offering.akses === "internal" ? 0 : detail.kuota_lintas_prodi ?? 0),
      akses: offering.akses || "internal",
      publishIssues: offeringPublishIssues(offering),
    })),
  );

  return (
    <DataTable
      data={rows}
      tableKey="opened_"
      rowKey={(row) => `${row.penawaran_id}-${row.kode}`}
      searchableFields={["nama", "kode"]}
      searchPlaceholder="Cari mata kuliah yang dibuka..."
      emptyText="Belum ada mata kuliah yang dibuka."
      columns={[
        { key: "nama", header: "Mata Kuliah" },
        { key: "kode", header: "Kode" },
        { key: "kapasitasTotal", header: "Total Awal/Kelas" },
        { key: "kuotaInternal", header: "Internal Awal/Kelas" },
        {
          key: "kuotaLintas",
          header: "Lintas Awal/Kelas",
          render: (row) => row.akses === "internal" ? "Tidak dibuka" : row.kuotaLintas ?? "—",
        },
        {
          key: "status",
          header: "Status",
          groupBy: "penawaran_id",
          filter: {
            type: "select",
            options: ["draft", "published", "closed"],
          },
          render: (row) => (
            <span className="badge badge-ghost badge-sm">
              {row.status}
            </span>
          ),
        },
        {
          header: "Aksi",
          className: "text-right",
          cellClassName: "text-right",
          groupBy: "penawaran_id",
          render: (row) => (
            <div className="flex justify-end gap-1">
              {canPublish && row.penawaran.status === "draft" && (
                <div className="flex flex-col items-end gap-1">
                  <Button
                    size="xs"
                    disabled={row.publishIssues.length > 0 || !periodOpen || periodLoading}
                    title={row.publishIssues.join(" ") || periodNotice || undefined}
                    onClick={() => onStatus(row.penawaran.id, "publish")}
                  >
                    Publikasikan
                  </Button>
                  {!periodOpen && !periodLoading && periodNotice && (
                    <span className="max-w-64 text-right text-xs text-warning" role="status">
                      {periodNotice}
                    </span>
                  )}
                  {periodLoading && (
                    <span className="text-xs text-base-content/60" role="status">
                      Memeriksa periode KRS...
                    </span>
                  )}
                  {!!row.publishIssues.length && (
                    <span className="max-w-64 text-right text-xs text-warning" role="status">
                      {row.publishIssues.join(" ")}
                    </span>
                  )}
                </div>
              )}
              {canClose && row.penawaran.status === "published" && (
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => onStatus(row.penawaran.id, "close")}
                >
                  Tutup
                </Button>
              )}
              {canPublish && row.penawaran.status === "closed" && (
                <Button
                  size="xs"
                  variant="outline"
                  onClick={() => onStatus(row.penawaran.id, "reopen")}
                >
                  Buka untuk edit
                </Button>
              )}
              {canDelete && row.penawaran.status === "draft" && (
                <IconButton
                  label="Hapus penawaran"
                  icon={Trash2}
                  tone="text-error"
                  onClick={() => onDelete(row.penawaran)}
                />
              )}
              <Link
                className="btn btn-ghost btn-xs"
                to={`/perkuliahan/penawaran-mk/${row.penawaran.id}`}
              >
                <ExternalLink size={14} /> Detail
              </Link>
            </div>
          ),
        },
      ]}
    />
  );
};
