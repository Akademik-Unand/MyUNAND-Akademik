import { Plus } from "lucide-react";
import {
  HARI_JADWAL,
  KONFLIK_LABEL,
  jadwalLabel,
} from "../../helpers/jadwal";

const chipClass = (jenisKonflik) => {
  if (!jenisKonflik?.size)
    return "border-base-300 bg-base-100 hover:border-primary";
  return "border-error bg-error/10 text-error";
};

const chipsTitle = (jenisKonflik) =>
  jenisKonflik?.size
    ? [...jenisKonflik].map((jenis) => KONFLIK_LABEL[jenis]).join("; ")
    : undefined;

const groupKelasByMatakuliah = (kelasList) => {
  const groups = new Map();
  kelasList.forEach((kelas) => {
    const matakuliahId = kelas.matakuliah_id || kelas.matakuliah?.id || kelas.id;
    if (!groups.has(matakuliahId)) {
      groups.set(matakuliahId, {
        id: matakuliahId,
        nama: kelas.matakuliah?.nama_resmi || "-",
        kelas: [],
      });
    }
    groups.get(matakuliahId).kelas.push(kelas);
  });
  return [...groups.values()];
};

/** Grid mingguan dengan satu baris untuk setiap kelas dan sel MK yang digabung. */
export const JadwalGrid = ({
  kelasList = [],
  konflik,
  canCreate,
  canUpdate,
  onAdd,
  onEdit,
  onView,
}) => {
  if (!kelasList.length) {
    return (
      <p className="text-sm text-base-content/60">
        Belum ada kelas pada semester ini.
      </p>
    );
  }

  const groups = groupKelasByMatakuliah(kelasList);

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 w-56 min-w-56 max-w-56 bg-base-100">
              Mata Kuliah
            </th>
            <th className="sticky left-56 z-10 min-w-20 bg-base-100">Kelas</th>
            {HARI_JADWAL.map((hari) => (
              <th key={hari} className="min-w-40">
                {hari}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.flatMap((group) =>
            group.kelas.map((kelas, index) => (
              <tr key={kelas.id}>
                {index === 0 && (
                  <td
                    rowSpan={group.kelas.length}
                    className="sticky left-0 z-10 w-56 min-w-56 max-w-56 bg-base-100 align-middle"
                  >
                    <button
                      type="button"
                      onClick={() => onView?.(kelas)}
                      className="btn btn-ghost h-auto min-h-0 justify-start whitespace-normal px-1 py-1 text-left font-medium text-primary"
                      aria-label={`Lihat detail ${group.nama}`}
                    >
                      {group.nama}
                    </button>
                  </td>
                )}
                <td className="sticky left-56 z-10 bg-base-100 align-middle">
                  <button
                    type="button"
                    onClick={() => onView?.(kelas)}
                    className="btn btn-ghost btn-xs min-w-10 font-medium"
                    aria-label={`Lihat detail kelas ${kelas.nama || "-"}`}
                  >
                    {kelas.nama || "-"}
                  </button>
                </td>
                {HARI_JADWAL.map((hari) => {
                  const items = (kelas.jadwalKelas || []).filter(
                    (jadwal) => jadwal.hari === hari,
                  );
                  return (
                    <td key={hari} className="align-top">
                      <div className="flex flex-col gap-1">
                        {items.map((jadwal) => {
                          const jenis = konflik?.get(jadwal.id);
                          return (
                            <button
                              key={jadwal.id}
                              type="button"
                              title={chipsTitle(jenis)}
                              disabled={!canUpdate}
                              onClick={() => onEdit?.(jadwal, kelas)}
                              className={`rounded-box border px-2 py-1 text-left text-xs transition-colors ${chipClass(jenis)} disabled:cursor-default`}
                            >
                              {jenis?.size ? "! " : ""}
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
            )),
          )}
        </tbody>
      </table>
    </div>
  );
};
