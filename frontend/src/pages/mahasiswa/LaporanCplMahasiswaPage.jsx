import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, ChevronDown, ChevronUp, Printer } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { StatCard } from "../../components/common/StatCard";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DashboardChart } from "../../components/dashboard/DashboardChart";
import { cplBarChart, cplRadarChart } from "../../helpers/dashboardChart";
import { getStudentCplReport } from "../../services/dashboard.service";

const fmt = (value) => value == null ? "Belum ada data" : Number(value).toLocaleString("id-ID", { maximumFractionDigits: 2 });

const Contributor = ({ item }) => (
  <details className="group rounded-lg border border-base-200 bg-base-100">
    <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-3">
      <div className="min-w-0">
        <p className="text-sm font-semibold">{item.matakuliah_kode} · {item.matakuliah_nama}</p>
        <p className="mt-1 text-xs text-base-content/65">
          {item.root_cpmk_nama}{item.cpmk_id !== item.root_cpmk_id ? ` › ${item.cpmk_nama}` : ""}
          {item.mapping?.scp_nama ? ` · ${item.mapping.scp_nama}` : ""}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Badge variant="success">{fmt(item.nilai)}</Badge>
        <ChevronDown className="size-4 group-open:hidden" />
        <ChevronUp className="hidden size-4 group-open:block" />
      </div>
    </summary>
    <div className="border-t border-base-200 px-3 py-2">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-base-content/55">Komponen pembentuk capaian</p>
      {item.components?.length ? (
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead><tr><th>Komponen</th><th className="text-right">Bobot</th><th className="text-right">Nilai</th></tr></thead>
            <tbody>{item.components.map((component) => (
              <tr key={component.id}>
                <td>{component.nama}</td>
                <td className="text-right">{Number(component.bobot).toLocaleString("id-ID")}%</td>
                <td className="text-right">{fmt(component.nilai)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      ) : <p className="text-sm text-base-content/60">Belum ada nilai komponen.</p>}
      {item.semester_tahun && <p className="mt-2 text-xs text-base-content/55">Semester pengambilan: {item.semester_tahun}</p>}
    </div>
  </details>
);

export const LaporanCplMahasiswaPage = () => {
  const [expanded, setExpanded] = useState(null);
  const query = useQuery({ queryKey: ["dashboard", "cpl-report"], queryFn: getStudentCplReport });
  const data = query.data;
  const rows = useMemo(() => data?.cpl || [], [data]);
  const chartRows = useMemo(
    () => rows.map((row) => ({ ...row, nama: row.nama_cp, target: row.nilai_min })),
    [rows],
  );

  useEffect(() => {
    if (!data || !window.location.hash) return;
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!rows.some((row) => row.id === id)) return;
    const timer = window.setTimeout(() => {
      setExpanded(id);
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [data, rows]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Laporan Capaian CPL"
        subtitle="Capaian dihitung dari nilai CPMK/Sub-CPMK pada mata kuliah yang telah disetujui."
        breadcrumbs={[{ label: "Dashboard", href: "/" }, { label: "Laporan CPL" }]}
        action={<Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="size-4" /> Cetak</Button>}
      />
      {query.isPending ? <CplReportSkeleton /> : query.isError ? (
        <Card><p className="text-sm text-error">Laporan CPL belum dapat dimuat. Silakan coba kembali.</p></Card>
      ) : (
        <>
          <Card title="Identitas Mahasiswa" subtitle="Kurikulum yang digunakan mengikuti angkatan mahasiswa">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Info label="Nama" value={data?.mahasiswa?.nama} />
              <Info label="NIM" value={data?.mahasiswa?.nim} />
              <Info label="Program Studi" value={data?.mahasiswa?.program_studi} />
              <Info label="Kurikulum" value={data?.kurikulum ? `${data.kurikulum.nama || "Kurikulum"} (${data.kurikulum.tahun || "—"})` : "Belum ditentukan"} />
            </div>
          </Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <StatCard title="Capaian Keseluruhan" value={fmt(data?.capaian_keseluruhan)} subtitle="Rata-rata CPL yang sudah memiliki nilai" icon={Award} />
            <StatCard title="CPL dengan Data" value={`${rows.filter((row) => row.nilai != null).length} / ${rows.length}`} subtitle="CPL tanpa nilai tidak dihitung sebagai nol" icon={Award} />
          </div>
          <DashboardChart
            title="Radar Capaian Seluruh CPL"
            subtitle="Bandingkan capaian mahasiswa dengan nilai minimum kurikulum pada setiap CPL"
            type="radar"
            height={800}
            bodyClassName="!p-1 md:!p-2"
            config={cplRadarChart(rows)}
          />
          <DashboardChart
            title="Capaian per CPL"
            subtitle="Perbandingan nilai capaian dengan target minimum pada kurikulum mahasiswa"
            config={cplBarChart(chartRows)}
          />
          <Card title="Ringkasan dan Sumber Capaian" subtitle="Pilih CPL untuk melihat CPMK, Sub-CPMK, dan nilai komponennya">
            {!rows.length ? <p className="text-sm text-base-content/60">Belum ada data CPL pada kurikulum mahasiswa.</p> : (
              <div className="space-y-3">
                {rows.map((row) => {
                  const isOpen = expanded === row.id;
                  return (
                    <section id={row.id} key={row.id} className="rounded-xl border border-base-200 p-3 md:p-4">
                      <button type="button" className="flex w-full items-center justify-between gap-3 text-left" onClick={() => setExpanded(isOpen ? null : row.id)} aria-expanded={isOpen}>
                        <span className="min-w-0">
                          <span className="block font-semibold">{row.nama_cp}</span>
                          <span className="mt-1 block text-sm text-base-content/65">{row.deskripsi || "Deskripsi CPL belum tersedia."}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-2">
                          <Badge variant={row.nilai == null ? "neutral" : row.nilai >= row.nilai_min ? "success" : "warning"}>{fmt(row.nilai)}</Badge>
                          {isOpen ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                        </span>
                      </button>
                      {isOpen && <div className="mt-3 space-y-2 border-t border-base-200 pt-3">
                        <p className="text-xs text-base-content/60">Target minimum: {fmt(row.nilai_min)} · {row.jumlah_kontributor} kontributor</p>
                        {row.nilai == null ? <p className="rounded-lg bg-base-200/60 p-3 text-sm text-base-content/70">Belum ada data penilaian dari mata kuliah yang berkontribusi.</p> : row.contributors.map((item) => <Contributor key={`${item.matakuliah_id}-${item.cpmk_id}`} item={item} />)}
                      </div>}
                    </section>
                  );
                })}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

const Info = ({ label, value }) => <div><p className="text-xs text-base-content/55">{label}</p><p className="mt-1 text-sm font-medium">{value || "—"}</p></div>;

const CplReportSkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-28 rounded-xl bg-base-200" />
    <div className="grid gap-4 sm:grid-cols-2"><div className="h-24 rounded-xl bg-base-200" /><div className="h-24 rounded-xl bg-base-200" /></div>
    <div className="space-y-3 rounded-xl bg-base-100 p-4 shadow-xs">{[1, 2, 3].map((item) => <div key={item} className="h-16 rounded-lg bg-base-200" />)}</div>
  </div>
);
