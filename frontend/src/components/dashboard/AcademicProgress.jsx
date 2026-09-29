import { Award, BookOpenCheck, GraduationCap, LibraryBig } from "lucide-react";
import { StatCard } from "../common/StatCard";

export const AcademicProgress = ({ data, readOnly = false }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard title="IPK" value={data?.ipk == null ? "-" : Number(data.ipk).toFixed(2)} subtitle="Belum tersedia bila nilai final belum tersimpan" icon={GraduationCap} />
      <StatCard title="SKS Lulus" value={String(data?.sks ?? 0)} subtitle="Mata kuliah disetujui" icon={BookOpenCheck} />
      <StatCard title="Mata Kuliah" value={String(data?.mata_kuliah ?? 0)} subtitle="Unik dan disetujui" icon={LibraryBig} />
      <StatCard title="CPL Tercapai" value={String(data?.cpl_tercapai ?? 0)} subtitle={readOnly ? "Ringkasan read-only" : "Memenuhi target CPL"} icon={Award} />
      <StatCard title="Rata-rata CPL" value={data?.capaian_keseluruhan == null ? "—" : Number(data.capaian_keseluruhan).toLocaleString("id-ID", { maximumFractionDigits: 2 })} subtitle="Dihitung dari CPL yang memiliki data" icon={Award} />
    </div>
  </div>
);
