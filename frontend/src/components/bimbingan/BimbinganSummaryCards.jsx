import {
  AlertTriangle,
  GraduationCap,
  UserCheck,
  UserX,
  Users,
} from "lucide-react";
import { Card } from "../ui/Card";
import { StatCard } from "../common/StatCard";

const angka = (value, isLoading) => (isLoading ? "…" : Number(value || 0));

/**
 * Ringkasan cakupan dosen PA. Kartu "Belum Punya PA" disorot karena mahasiswa
 * tanpa PA aktif akan ditolak saat mengambil KRS.
 */
export const BimbinganSummaryCards = ({ summary, isLoading }) => {
  const belum = Number(summary?.belum_punya_pa || 0);
  const beban = summary?.beban_teratas || [];

  return (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Mahasiswa"
          value={angka(summary?.total_mahasiswa, isLoading)}
          subtitle="dalam filter unit aktif"
          icon={GraduationCap}
        />
        <StatCard
          title="Sudah Punya PA"
          value={angka(summary?.sudah_punya_pa, isLoading)}
          subtitle="punya dosen PA aktif"
          icon={UserCheck}
        />
        <StatCard
          title="Belum Punya PA"
          value={angka(summary?.belum_punya_pa, isLoading)}
          subtitle={
            belum > 0
              ? "terblokir saat ambil KRS"
              : "semua mahasiswa terbimbing"
          }
          icon={UserX}
          className={belum > 0 ? "border border-warning/40" : ""}
        />
        <StatCard
          title="Dosen Membimbing"
          value={angka(summary?.dosen_membimbing, isLoading)}
          subtitle="dosen dengan bimbingan aktif"
          icon={Users}
        />
      </div>

      {belum > 0 && (
        <div className="flex items-start gap-2 rounded-box border border-warning/40 bg-warning/10 px-3 py-2 text-xs text-base-content/80">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-warning" />
          <p>
            <span className="font-semibold">
              {belum} mahasiswa belum punya dosen PA.
            </span>{" "}
            Mereka tidak dapat mengambil KRS — baik mata kuliah reguler maupun
            lintas prodi — sampai ditetapkan lewat tombol{" "}
            <span className="font-medium">Tetapkan Massal</span>.
          </p>
        </div>
      )}

      {beban.length > 0 && (
        <Card
          title="Sebaran Beban Bimbingan"
          subtitle="5 dosen dengan mahasiswa terbanyak"
        >
          <ul className="divide-y divide-base-200">
            {beban.map((row, idx) => (
              <li
                key={row.id}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span className="w-5 shrink-0 text-xs text-base-content/40">
                    {idx + 1}.
                  </span>
                  <span className="truncate text-base-content">{row.nama}</span>
                </span>
                <span className="shrink-0 text-xs text-base-content/60">
                  {isLoading ? "…" : `${row.jumlah} mahasiswa`}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
};
