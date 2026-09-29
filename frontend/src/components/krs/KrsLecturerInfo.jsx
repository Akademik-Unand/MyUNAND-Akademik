import { UsersRound } from "lucide-react";

/** Daftar dosen pengampu untuk kolom tabel KRS. */
export const KrsLecturerInfo = ({ kelas }) => {
  const lecturers = [...new Map(
    (kelas?.dosenKelas || [])
      .map(({ dosen }) => dosen)
      .filter((dosen) => dosen?.id)
      .map((dosen) => [dosen.id, dosen.nama || dosen.nip]),
  ).values()];

  return (
    <div className="flex min-w-40 items-start gap-1.5 text-xs">
      <UsersRound size={13} className="mt-0.5 shrink-0 text-base-content/50" />
      <span>{lecturers.length ? lecturers.join(", ") : "Belum ditentukan"}</span>
    </div>
  );
};
