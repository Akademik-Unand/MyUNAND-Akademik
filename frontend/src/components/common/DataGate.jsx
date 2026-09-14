import { FilterX } from "lucide-react";
import { Card } from "../ui/Card";

/**
 * Kartu pengganti tabel saat data "dikunci" di belakang filter/scope global
 * (mis. unit organisasi di navbar atau semester) agar halaman tidak menampilkan
 * seluruh data sekaligus sebelum ada konteks yang jelas.
 */
export const DataGate = ({
  title = "Pilih filter dulu",
  message = "Pilih unit organisasi (fakultas/departemen/prodi) di navbar atau terapkan filter di atas untuk melihat datanya.",
}) => (
  <Card title={title}>
    <div className="flex flex-col items-center gap-3 py-10 text-center text-sm text-base-content/60">
      <FilterX size={28} className="opacity-40" />
      <p className="max-w-md">{message}</p>
    </div>
  </Card>
);