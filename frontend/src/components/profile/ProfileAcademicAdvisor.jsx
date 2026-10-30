import { GraduationCap } from "lucide-react";
import { Card } from "../ui/Card";
import { Skeleton } from "../ui/Skeleton";
import { Button } from "../ui/Button";
import { useAcademicAdvisor } from "../../hooks/useAcademicAdvisor";

/**
 * Read-only advisor information for the current student.
 * @param {{ compact?: boolean }} props Use a short summary in the account dropdown.
 */
export const ProfileAcademicAdvisor = ({ compact = false }) => {
  const { data, isStudent, isLinked, isPending, isError, isFetching, refetch } =
    useAcademicAdvisor();
  if (!isStudent) return null;

  let content;
  if (!isLinked || (!isError && data?.status === "unlinked")) {
    content = (
      <p className="text-base-content/70 group-hover:text-base-content group-active:text-neutral-content">
        Akun belum terhubung ke data mahasiswa.
        {!compact && " Hubungi program studi untuk menghubungkan akun Anda."}
      </p>
    );
  } else if (isError) {
    content = (
      <div className="space-y-2">
        <p className="text-base-content/70 group-hover:text-base-content group-active:text-neutral-content">Informasi dosen PA gagal dimuat.</p>
        {!compact && (
          <Button variant="ghost" size="xs" isLoading={isFetching} onClick={() => refetch()}>
            Coba lagi
          </Button>
        )}
      </div>
    );
  } else if (isPending) {
    content = (
      <div role="status" aria-label="Memuat dosen PA" className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        {!compact && <Skeleton className="h-4 w-1/2" />}
      </div>
    );
  } else if (data?.status === "assigned" && data.advisor) {
    const advisor = data.advisor;
    content = compact ? (
      <p className="text-base-content/80 group-hover:text-base-content group-active:text-neutral-content">{advisor.nama || "Nama dosen belum tersedia"}</p>
    ) : (
      <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-base-content/60 group-hover:text-base-content group-active:text-neutral-content">Nama dosen</dt>
          <dd className="mt-1 font-medium">{advisor.nama || "Nama dosen belum tersedia"}</dd>
        </div>
        <div>
          <dt className="text-base-content/60 group-hover:text-base-content group-active:text-neutral-content">NIP</dt>
          <dd className="mt-1">{advisor.nip || "—"}</dd>
        </div>
        <div>
          <dt className="text-base-content/60 group-hover:text-base-content group-active:text-neutral-content">Program studi dosen</dt>
          <dd className="mt-1">{advisor.program_studi?.nama || "—"}</dd>
        </div>
        <div>
          <dt className="text-base-content/60 group-hover:text-base-content group-active:text-neutral-content">Tahun akademik penetapan</dt>
          <dd className="mt-1">{advisor.tahun_akademik || "—"}</dd>
        </div>
      </dl>
    );
  } else {
    content = (
      <p className="text-base-content/70 group-hover:text-base-content group-active:text-neutral-content">
        Dosen PA belum ditetapkan.
        {!compact && " Hubungi program studi untuk penetapan dosen pembimbing akademik."}
      </p>
    );
  }

  if (compact) {
    return (
      <div className="w-full min-w-0 space-y-0.5 rounded-lg p-2 text-left text-xs font-normal transition-colors duration-150 hover:bg-base-200/60 cursor-default select-text">
        <p className="flex items-center gap-1.5 font-medium text-base-content/60">
          <GraduationCap size={13} className="shrink-0 text-primary" />
          <span>Dosen PA</span>
        </p>
        <div className="text-base-content font-medium pl-4 text-xs truncate">
          {content}
        </div>
      </div>
    );
  }

  return (
    <Card title="Dosen Pembimbing Akademik" bodyClassName="min-w-0">
      <div className="text-sm wrap-anywhere" aria-live="polite">{content}</div>
    </Card>
  );
};
