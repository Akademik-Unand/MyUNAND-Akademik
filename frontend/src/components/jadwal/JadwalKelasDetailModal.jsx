import { kelasDosenNames } from "../../helpers/kelasInfo";
import { HARI_JADWAL, jadwalLabel } from "../../helpers/jadwal";
import {
  prodiDepartemenLabel,
  semesterAkademikLabel,
} from "../../helpers/academicLabel";
import { Modal } from "../ui/Modal";

const Info = ({ label, children }) => (
  <div className="space-y-0.5">
    <dt className="text-xs text-base-content/60">{label}</dt>
    <dd className="text-sm font-medium">{children || "-"}</dd>
  </div>
);

const orderedSchedules = (kelas) =>
  [...(kelas?.jadwalKelas || [])].sort(
    (a, b) => {
      const position = (hari) => {
        const index = HARI_JADWAL.indexOf(hari);
        if (index >= 0) return index;
        if (hari === "Sabtu") return HARI_JADWAL.length;
        if (hari === "Minggu") return HARI_JADWAL.length + 1;
        return HARI_JADWAL.length + 2;
      };
      return position(a.hari) - position(b.hari);
    },
  );

export const JadwalKelasDetailModal = ({ kelas, onClose }) => {
  const matakuliah = kelas?.matakuliah;
  const schedules = orderedSchedules(kelas);

  return (
    <Modal
      open={Boolean(kelas)}
      onClose={onClose}
      title="Detail Jadwal Kelas"
      subtitle={kelas ? `${matakuliah?.nama_resmi || "Mata Kuliah"} - Kelas ${kelas.nama || "-"}` : ""}
      size="lg"
    >
      <div className="space-y-5">
        <dl className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3">
          <Info label="Kode Mata Kuliah">{matakuliah?.kode_matakuliah}</Info>
          <Info label="SKS">
            {matakuliah?.jumlah_sks_kurikulum ?? matakuliah?.jumlah_sks}
          </Info>
          <Info label="Semester">
            {semesterAkademikLabel(kelas?.semester)}
          </Info>
          <Info label="Program Studi">
            {prodiDepartemenLabel(kelas?.programStudi)}
          </Info>
          <Info label="Dosen Pengampu">{kelasDosenNames(kelas)}</Info>
          <Info label="Kapasitas Kelas">
            {kelas?.jumlah_peserta_max ?? "-"}
          </Info>
        </dl>

        <section>
          <h4 className="mb-2 text-sm font-semibold">Jadwal Pertemuan</h4>
          {schedules.length ? (
            <ul className="divide-y divide-base-200 rounded-box border border-base-300">
              {schedules.map((jadwal) => (
                <li
                  key={jadwal.id}
                  className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{jadwal.hari}</span>
                  <span className="text-base-content/70">
                    {jadwalLabel(jadwal)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-box border border-dashed border-base-300 px-3 py-4 text-sm text-base-content/60">
              Jadwal kelas ini belum diatur.
            </p>
          )}
        </section>
      </div>
    </Modal>
  );
};
