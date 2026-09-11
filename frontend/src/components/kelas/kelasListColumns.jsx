import { Link } from "react-router-dom";
import { Settings2 } from "lucide-react";
import { IconLink } from "../common/IconButton";
import { Badge } from "../ui/Badge";
import { Can } from "../auth/Can";
import {
  semesterAkademikLabel,
  prodiDepartemenLabel,
} from "../../helpers/semesterProdi";
import { kelasDisplayName, matakuliahListLabel } from "../../helpers/kelasInfo";

export const buildKelasListColumns = ({
  actionTo = (row) => `/perkuliahan/kelas/${row.id}`,
  actionLabel = "Kelola kelas",
  showProgress = true,
  actionButton = false,
  actionGate,
  extraAction,
} = {}) => {
  const columns = [
    { header: "#", render: (_, idx) => idx + 1 },
    {
      key: "nama",
      header: "Kelas",
      sortable: true,
      cellClassName: "font-semibold whitespace-nowrap",
      render: (row) => kelasDisplayName(row),
    },
    {
      key: "matakuliah_id",
      header: "Mata Kuliah",
      sortable: true,
      render: (row) => matakuliahListLabel(row.matakuliah),
    },
    {
      key: "sks",
      header: "SKS",
      render: (row) => row.matakuliah?.jumlah_sks_kurikulum ?? "—",
    },
    {
      key: "prodi",
      header: "Prodi",
      render: (row) => prodiDepartemenLabel(row.semesterProdi?.programStudi),
    },
    {
      key: "semester_prodi_id",
      header: "Semester",
      render: (row) => semesterAkademikLabel(row.semesterProdi?.semester),
    },
    {
      key: "jumlah_peserta",
      header: "Jumlah Peserta",
      render: (row) => row.jumlah_peserta ?? "—",
    },
    {
      key: "jumlah_peserta_max",
      header: "Kapasitas",
      render: (row) => row.jumlah_peserta_max || "—",
    },
  ];

  if (showProgress) {
    columns.push({
      key: "progress_upload_nilai",
      header: "Progress Upload Nilai",
      render: (row) => {
        const value = row.progress_upload_nilai || "Belum";
        return (
          <Badge variant={value === "Ada" ? "success" : "warning"} outline>
            {value}
          </Badge>
        );
      },
    });
  }

  columns.push({
    header: "Aksi",
    className: "text-right",
    cellClassName: "text-right",
    render: (row) => {
      const control = actionButton ? (
        <Link to={actionTo(row)} className="btn btn-info btn-xs">
          Kelola
        </Link>
      ) : (
        <IconLink
          label={actionLabel}
          icon={Settings2}
          tone="text-info"
          tooltipPosition="tooltip-left"
          to={actionTo(row)}
        />
      );
      const content = (
        <div className="flex items-center justify-end gap-1">
          {extraAction?.(row)}
          {control}
        </div>
      );
      if (!actionGate) return content;
      return <Can {...actionGate}>{content}</Can>;
    },
  });

  return columns;
};

export const kelasListColumns = buildKelasListColumns();
