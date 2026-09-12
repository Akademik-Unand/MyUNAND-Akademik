import { Clock } from "lucide-react";
import { Card } from "../ui/Card";
import { semesterAkademikLabel } from "../../helpers/academicLabel";
import { formatTanggalId } from "../../utils/formatTanggal";

const Field = ({ label, value }) => (
  <div>
    <p className="text-xs text-base-content/60">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

/**
 * Kartu jendela periode akademik berjalan. Jadwal KRS dibaca dari `periode`
 * global (satu sumber untuk seluruh universitas), bukan tanggal per prodi.
 * @param {Object} props
 * @param {Object} [props.semester] — baris semester untuk label tahun/jenis
 * @param {Object} [props.periode] — blok periode jenis `krs` dari API
 * @param {number|string} [props.sksMaksimal] — tampil bila diisi
 * @param {string} [props.title] — judul kartu
 */
export const PeriodeAkademikCard = ({
  semester,
  periode,
  sksMaksimal,
  title = "Periode Akademik Berjalan",
}) => {
  const hasSks = sksMaksimal !== undefined && sksMaksimal !== null;
  return (
    <Card title={title} icon={Clock}>
      <div
        className={`grid gap-3 ${hasSks ? "md:grid-cols-4" : "md:grid-cols-3"}`}
      >
        <Field label="Semester" value={semesterAkademikLabel(semester)} />
        <Field
          label="KRS Mulai"
          value={formatTanggalId(periode?.tanggal_mulai) || "—"}
        />
        <Field
          label="KRS Selesai"
          value={formatTanggalId(periode?.tanggal_selesai) || "—"}
        />
        {hasSks && <Field label="Maksimal SKS" value={`${sksMaksimal} SKS`} />}
      </div>
    </Card>
  );
};
