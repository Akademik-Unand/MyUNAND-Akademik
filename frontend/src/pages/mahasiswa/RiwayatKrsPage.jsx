import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, History } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/common/PageHeader";
import { DataTable } from "../../components/common/DataTable";
import { Skeleton } from "../../components/ui/Skeleton";
import { KrsScheduleInfo } from "../../components/krs/KrsScheduleInfo";
import { KrsLecturerInfo } from "../../components/krs/KrsLecturerInfo";
import { useAuthStore } from "../../store/auth.store";
import {
  downloadKrsPdf,
  getStudentKrsContext,
  getStudentKrsHistory,
} from "../../services/krs.service";
import { semesterAkademikLabel } from "../../helpers/academicLabel";
import {
  approvalStatusLabel,
  krsDocumentAvailability,
  registeredKrsRows,
} from "../../utils/crossEnrollment";

const statusVariant = { approved: "success", pending_pa: "warning", rejected: "error" };

const HistoryTableSkeleton = () => (
  <div className="space-y-3">
    <div className="flex justify-end">
      <Skeleton className="h-8 w-full sm:w-64" />
    </div>
    <div className="overflow-x-auto rounded-box border border-base-300">
      <div className="min-w-[900px]">
        <div className="grid grid-cols-[2fr_0.7fr_1.5fr_1.2fr_0.8fr] gap-3 border-b border-base-300 bg-base-200/50 px-3 py-2">
          {["w-24", "w-10", "w-24", "w-28", "w-12"].map((width, index) => (
            <Skeleton key={index} className={`h-3 ${width}`} />
          ))}
        </div>
        {[0, 1, 2].map((row) => (
          <div key={row} className="grid grid-cols-[2fr_0.7fr_1.5fr_1.2fr_0.8fr] items-center gap-3 border-b border-base-200 px-3 py-3 last:border-0">
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-4 w-10" />
            <div className="space-y-1.5">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const RiwayatKrsSkeleton = () => (
  <div className="space-y-4">
    <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
      <div className="space-y-2">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-7 w-44" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      <Skeleton className="h-6 w-24" />
    </div>
    {[0, 1].map((card) => (
      <Card
        key={card}
        title={<Skeleton className="h-5 w-48" />}
        actions={
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-8 w-24" />
          </div>
        }
      >
        <HistoryTableSkeleton />
      </Card>
    ))}
  </div>
);

export const RiwayatKrsPage = () => {
  const user = useAuthStore((state) => state.user);
  const context = useQuery({
    queryKey: ["krs", "student-context", user?.id],
    queryFn: getStudentKrsContext,
    enabled: Boolean(user?.id),
  });
  const history = useQuery({
    queryKey: ["krs", "student-history", user?.id],
    queryFn: getStudentKrsHistory,
    enabled: Boolean(user?.id && context.data?.mahasiswa?.id),
  });
  const download = useMutation({
    mutationFn: downloadKrsPdf,
    onSuccess: (filename) => toast.success(`Dokumen diunduh: ${filename}`),
    onError: (error) => toast.error(error.message),
  });

  if (context.isPending || (context.data && history.isPending)) {
    return <RiwayatKrsSkeleton />;
  }
  if (context.isError || history.isError) {
    return (
      <Card title="Riwayat KRS">
        <p role="alert" className="text-sm text-error">
          Gagal memuat riwayat KRS. {(context.error || history.error)?.message}
        </p>
        <Button size="sm" variant="outline" onClick={() => context.refetch()}>
          Coba lagi
        </Button>
      </Card>
    );
  }
  if (!context.data?.mahasiswa?.id) {
    return <Card title="Riwayat KRS"><p className="text-sm text-base-content/60">Halaman ini khusus untuk akun mahasiswa.</p></Card>;
  }

  const rows = history.data?.data || [];
  const activeSemesterId = context.data?.semester?.id;
  const pastRows = rows.filter((row) => row.semester_id !== activeSemesterId);
  const semesterCount = new Set(pastRows.map((row) => row.semester_id)).size;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Riwayat KRS"
        subtitle="Lihat KRS dari semester sebelumnya dan unduh dokumen yang sudah disetujui."
        breadcrumbs={[{ label: "KRS Mahasiswa" }, { label: "Riwayat KRS" }]}
        action={<Badge variant="info"><History size={14} className="mr-1" />{semesterCount} semester</Badge>}
      />
      {!pastRows.length ? (
        <Card>
          <div className="py-6 text-center">
            <History size={28} className="mx-auto mb-2 text-base-content/40" />
            <p className="font-medium">Belum ada riwayat KRS semester sebelumnya</p>
            <p className="mt-1 text-sm text-base-content/60">KRS pada semester berjalan tersedia di menu Pengambilan KRS.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {pastRows.map((krs) => {
            const detailRows = registeredKrsRows(krs.krsDetil);
            const availability = krsDocumentAvailability(krs, detailRows);
            return (
              <Card
                key={krs.id}
                title={`${semesterAkademikLabel(krs.semester)} · ${detailRows.length} Mata Kuliah`}
                actions={
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Badge size="xs" variant={Number(krs.approval_ke) > 0 ? "success" : "warning"}>
                      {Number(krs.approval_ke) > 0 ? "Disetujui" : "Belum disetujui"}
                    </Badge>
                    <Button
                      size="sm"
                      variant={availability.available ? "primary" : "outline"}
                      disabled={!availability.available || download.isPending}
                      title={availability.message}
                      onClick={() => download.mutate(krs.id)}
                    >
                      <Download size={14} />
                      <span className="hidden sm:inline">Unduh PDF</span>
                      <span className="sm:hidden">Unduh</span>
                    </Button>
                  </div>
                }
              >
                {detailRows.length ? (
                  <DataTable
                    data={detailRows}
                    tableKey={`krs_history_${krs.id}_`}
                    rowKey={(row) => row.id}
                    searchableFields={["nama", "kode"]}
                    searchPlaceholder="Cari mata kuliah di semester ini..."
                    columns={[
                      {
                        key: "nama",
                        header: "Mata Kuliah",
                        render: (row) => (
                          <div>
                            <div className="font-medium">{row.nama}</div>
                            <div className="text-xs text-base-content/60">
                              {row.kode}{row.lintas ? " · Lintas Prodi" : ""}
                            </div>
                          </div>
                        ),
                      },
                      {
                        key: "kelas",
                        header: "Kelas",
                        className: "min-w-20",
                        render: (row) => row.kelas?.nama || "—",
                      },
                      {
                        key: "jadwal",
                        header: "Jadwal & Ruang",
                        className: "min-w-52",
                        cellClassName: "min-w-52",
                        render: (row) => <KrsScheduleInfo kelas={row.kelas} />,
                      },
                      {
                        key: "pengampu",
                        header: "Dosen Pengampu",
                        className: "min-w-44",
                        cellClassName: "min-w-44",
                        render: (row) => <KrsLecturerInfo kelas={row.kelas} />,
                      },
                      {
                        key: "status",
                        header: "Status",
                        render: (row) => (
                          <Badge variant={statusVariant[row.status] || "ghost"} size="xs">
                            {approvalStatusLabel(row.status)}
                          </Badge>
                        ),
                      },
                    ]}
                  />
                ) : (
                  <p className="rounded-box bg-base-200/60 px-3 py-2 text-sm text-base-content/60">Belum ada mata kuliah di KRS semester ini.</p>
                )}
              </Card>
            );
          })}
          {history.data?.pagination?.total > rows.length && (
            <p className="text-center text-xs text-base-content/60">
              Riwayat yang ditampilkan dibatasi {rows.length} KRS terbaru.
            </p>
          )}
        </div>
      )}
    </div>
  );
};
