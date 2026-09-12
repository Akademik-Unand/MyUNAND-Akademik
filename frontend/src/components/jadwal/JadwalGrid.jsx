import { Plus } from "lucide-react";
import {
  HARI_JADWAL,
  KONFLIK_LABEL,
  jadwalLabel,
  ringkasanJadwalKelas,
} from "../../helpers/jadwal";
import { kelasDisplayName, kelasDosenNames } from "../../helpers/kelasInfo";
import { Badge } from "../ui/Badge";

const chipClass = (jenisKonflik) => {
  if (!jenisKonflik?.size)
    return "border-base-300 bg-base-100 hover:border-primary";
  return "border-error bg-error/10 text-error";
};

const chipsTitle = (jenisKonflik) =>
  jenisKonflik?.size
    ? [...jenisKonflik].map((jenis) => KONFLIK_LABEL[jenis]).join("; ")
    : undefined;

/**
 * Grid mingguan: baris = kelas, kolom = hari. Tiap sel menampilkan jadwal kelas
 * pada hari tersebut (shift · jam · ruang) dan menandai yang bentrok.
 *
 * Kolom kiri juga merangkum kebutuhan tiap kelas — jumlah sesi, kapasitas ruang
 * minimal, dan berapa sesi yang ruangnya masih kurang — supaya konflik kapasitas
 * terlihat sebelum jadwal disimpan.
 */
export const JadwalGrid = ({
  kelasList = [],
  konflik,
  canCreate,
  canUpdate,
  onAdd,
  onEdit,
}) => {
  if (!kelasList.length) {
    return (
      <p className="text-sm text-base-content/60">
        Belum ada kelas pada semester ini.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 min-w-64 bg-base-100">
              Mata Kuliah / Kelas
            </th>
            {HARI_JADWAL.map((hari) => (
              <th key={hari} className="min-w-40">
                {hari}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {kelasList.map((kelas) => {
            const ringkasan = ringkasanJadwalKelas(kelas);
            return (
              <tr key={kelas.id}>
                <td className="sticky left-0 z-10 bg-base-100 align-top">
                  <div className="font-medium">
                    {kelas.matakuliah?.nama_resmi || "—"}
                  </div>
                  <div className="text-xs text-base-content/60">
                    {kelasDisplayName(kelas)} · {kelasDosenNames(kelas)}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <Badge
                      variant={ringkasan.sesi ? "neutral" : "ghost"}
                      size="xs"
                    >
                      {ringkasan.sesi} sesi
                    </Badge>
                    <Badge
                      variant={
                        ringkasan.kebutuhanKapasitas ? "ghost" : "warning"
                      }
                      size="xs"
                    >
                      {ringkasan.kebutuhanKapasitas
                        ? `butuh ruang ≥ ${ringkasan.kebutuhanKapasitas}`
                        : "kapasitas kelas belum diatur"}
                    </Badge>
                    {ringkasan.kurangKapasitas > 0 && (
                      <Badge variant="error" size="xs">
                        {ringkasan.kurangKapasitas} ruang kurang kapasitas
                      </Badge>
                    )}
                  </div>

                  {(ringkasan.shift.length > 0 ||
                    ringkasan.ruang.length > 0) && (
                    <div className="mt-0.5 text-xs text-base-content/50">
                      {ringkasan.shift.length > 0 && (
                        <span>Shift: {ringkasan.shift.join(", ")}</span>
                      )}
                      {ringkasan.shift.length > 0 &&
                        ringkasan.ruang.length > 0 && <span> · </span>}
                      {ringkasan.ruang.length > 0 && (
                        <span>Ruang: {ringkasan.ruang.join(", ")}</span>
                      )}
                    </div>
                  )}
                </td>
                {HARI_JADWAL.map((hari) => {
                  const items = (kelas.jadwalKelas || []).filter(
                    (jadwal) => jadwal.hari === hari,
                  );
                  return (
                    <td key={hari} className="align-top">
                      <div className="flex flex-col gap-1">
                        {items.map((jadwal) => {
                          const jenis = konflik.get(jadwal.id);
                          return (
                            <button
                              key={jadwal.id}
                              type="button"
                              title={chipsTitle(jenis)}
                              disabled={!canUpdate}
                              onClick={() => onEdit?.(jadwal, kelas)}
                              className={`rounded-box border px-2 py-1 text-left text-xs transition-colors ${chipClass(jenis)} disabled:cursor-default`}
                            >
                              {jenis?.size ? "⚠ " : ""}
                              {jadwalLabel(jadwal)}
                            </button>
                          );
                        })}
                        {canCreate && (
                          <button
                            type="button"
                            aria-label={`Tambah jadwal ${hari}`}
                            title={`Tambah jadwal ${hari}`}
                            onClick={() => onAdd?.(kelas, hari)}
                            className="inline-flex items-center gap-1 rounded-box px-1 py-1 text-xs text-base-content/40 hover:text-primary"
                          >
                            <Plus size={12} /> Tambah
                          </button>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
