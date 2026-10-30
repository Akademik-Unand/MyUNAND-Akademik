import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronDown, Clock, Settings2 } from "lucide-react";
import { Badge } from "../ui/Badge";
import { useAuthStore } from "../../store/auth.store";
import { isUniversityAdminRole } from "../../constants/roles";
import { getActiveSemesterContext } from "../../services/semester.service";
import { semesterAkademikLabel } from "../../helpers/academicLabel";
import { JENIS_PERIODE, todayDateOnly } from "../../helpers/academicPeriod";
import { formatTanggalId } from "../../utils/formatTanggal";

const PERIOD_ITEMS = [
  { key: JENIS_PERIODE.KRS, label: "Pengisian KRS" },
  { key: JENIS_PERIODE.CPMK, label: "CPMK & Sumber Penilaian" },
  { key: JENIS_PERIODE.NILAI, label: "Input & Upload Nilai" },
];

const getPeriodWindowState = (row, today = todayDateOnly()) => {
  if (!row?.tanggal_mulai || !row?.tanggal_selesai) {
    return {
      statusLabel: "Belum diatur",
      variant: "ghost",
      rangeLabel: "Jadwal belum ditetapkan",
    };
  }
  const rangeLabel = `${formatTanggalId(row.tanggal_mulai)} – ${formatTanggalId(row.tanggal_selesai)}`;
  if (row.tanggal_mulai <= today && today <= row.tanggal_selesai) {
    return { statusLabel: "Dibuka", variant: "success", rangeLabel };
  }
  if (today < row.tanggal_mulai) {
    return { statusLabel: "Terjadwal", variant: "info", rangeLabel };
  }
  return { statusLabel: "Ditutup", variant: "ghost", rangeLabel };
};

export const useActiveSemesterContext = () =>
  useQuery({
    queryKey: ["setting-semester", "active-context"],
    queryFn: getActiveSemesterContext,
    staleTime: 60_000,
  });

export const ActiveSemesterBadge = () => {
  const user = useAuthStore((state) => state.user);
  const isUnivAdmin =
    isUniversityAdminRole(user?.role) ||
    (user?.roles || []).some((r) => isUniversityAdminRole(r.name || r));
  const { data, isLoading } = useActiveSemesterContext();
  const semester = data?.semester || null;
  const periodes = data?.periodes || [];

  if (isLoading) {
    return (
      <div
        className="hidden sm:block skeleton h-8 w-32 rounded-field"
        aria-label="Memuat semester aktif"
      />
    );
  }

  const label = semester ? semesterAkademikLabel(semester) : "Belum Aktif";
  const today = todayDateOnly();

  return (
    <div className="dropdown dropdown-end hidden sm:inline-block">
      <button
        type="button"
        tabIndex={0}
        className="btn btn-ghost btn-sm gap-2 px-2.5 border border-base-300/80 bg-base-200/40 hover:bg-base-200"
        title={
          semester
            ? `Semester Akademik Berjalan: ${label}`
            : "Belum ada semester akademik yang diaktifkan"
        }
      >
        <span
          className={`h-2 w-2 rounded-full shrink-0 ${
            semester
              ? "bg-success ring-2 ring-success/25"
              : "bg-warning ring-2 ring-warning/25"
          }`}
        />
        <Calendar size={13} className="text-primary shrink-0" />
        <span className="text-xs font-semibold text-base-content truncate max-w-36">
          {label}
        </span>
        <ChevronDown size={12} className="shrink-0 opacity-60" />
      </button>

      <div
        tabIndex={0}
        className="dropdown-content w-80 max-w-[calc(100vw-1rem)] rounded-box border border-base-300 bg-base-100 p-3.5 shadow-xl z-50 mt-2 space-y-3"
      >
        <div className="flex items-start justify-between gap-2 border-b border-base-200 pb-2.5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-base-content/50">
              Semester Akademik Berjalan
            </p>
            <p className="text-sm font-bold text-base-content mt-0.5">
              {semester ? `Semester ${label}` : "Belum ada semester aktif"}
            </p>
            {semester?.tanggal_mulai && semester?.tanggal_selesai && (
              <p className="text-[11px] text-base-content/60 mt-0.5">
                {formatTanggalId(semester.tanggal_mulai)} –{" "}
                {formatTanggalId(semester.tanggal_selesai)}
              </p>
            )}
          </div>
          <Badge variant={semester ? "success" : "warning"} size="xs" soft>
            {semester ? "Aktif" : "Nonaktif"}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-base-content/70">
            <Clock size={12} className="text-primary" />
            <span>Status Jendela Periode Operasional</span>
          </div>

          <div className="space-y-1.5">
            {PERIOD_ITEMS.map((item) => {
              const row = periodes.find((p) => p.jenis === item.key);
              const state = getPeriodWindowState(row, today);
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between gap-2 rounded-field bg-base-200/50 px-2.5 py-1.5"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-base-content truncate">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-base-content/60 truncate">
                      {state.rangeLabel}
                    </p>
                  </div>
                  <Badge variant={state.variant} size="xs" soft>
                    {state.statusLabel}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        {isUnivAdmin && (
          <div className="flex items-center justify-between gap-2 border-t border-base-200 pt-2 text-xs">
            <Link
              to="/master/semester/setting"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              <Settings2 size={12} />
              <span>Setting Semester</span>
            </Link>
            <Link
              to="/master/semester/periode"
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              <span>Kelola Periode →</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export const ActiveSemesterProfileRow = () => {
  const { data } = useActiveSemesterContext();
  const semester = data?.semester || null;
  const label = semester ? semesterAkademikLabel(semester) : "Belum diatur";

  return (
    <div className="flex min-w-0 items-start gap-1.5 mt-1 text-[11px] font-medium text-base-content/70">
      <Calendar size={13} className="mt-0.5 shrink-0 text-primary" />
      <span className="min-w-0 whitespace-normal break-words leading-tight">
        Semester Aktif: {label}
      </span>
    </div>
  );
};
