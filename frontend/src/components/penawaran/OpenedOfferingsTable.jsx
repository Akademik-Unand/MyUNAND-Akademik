import { Link } from "react-router-dom";
import { ExternalLink, Trash2 } from "lucide-react";
import { DataTable } from "../common/DataTable";
import { Button } from "../ui/Button";
import { IconButton } from "../common/IconButton";
import { useResourceQuery } from "../../hooks/useResourceQuery";

/**
 * Menampilkan satu baris PER MATA KULIAH dari semua penawaran yang dibuka.
 * Status dan Aksi berlaku di level penawaran, jadi digabung (rowspan) per
 * penawaran supaya tidak berulang di tiap baris mata kuliah.
 */
export const OpenedOfferingsTable = ({
  filter,
  onStatus,
  canPublish = false,
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
      nama:
        detail.matakuliah?.nama_resmi ||
        detail.matakuliah?.kode_matakuliah ||
        "—",
      kode: detail.matakuliah?.kode_matakuliah || "—",
      kapasitas:
        detail.kuota_lintas_prodi ?? offering.kuota_lintas_prodi_default,
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
        {
          key: "kapasitas",
          header: "Kapasitas Lintas",
          render: (row) => row.kapasitas ?? "—",
        },
        {
          key: "status",
          header: "Status",
          groupBy: "penawaran_id",
          render: (row) => (
            <span className="badge badge-ghost badge-sm">
              {row.penawaran.status || "draft"}
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
                <Button
                  size="xs"
                  onClick={() => onStatus(row.penawaran.id, "publish")}
                >
                  Publikasikan
                </Button>
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
