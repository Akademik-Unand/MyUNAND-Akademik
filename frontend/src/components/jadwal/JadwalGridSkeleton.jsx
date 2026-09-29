import { HARI_JADWAL } from "../../helpers/jadwal";
import { Skeleton } from "../ui/Skeleton";

const PLACEHOLDER_ROWS = 6;

/** Placeholder yang mengikuti dua kolom identitas dan kolom hari pada grid. */
export const JadwalGridSkeleton = () => (
  <div className="overflow-x-auto" aria-label="Memuat grid jadwal">
    <table className="table table-sm">
      <thead>
        <tr>
          <th className="sticky left-0 z-10 w-56 min-w-56 max-w-56 bg-base-100">
            <Skeleton className="h-4 w-28" />
          </th>
          <th className="sticky left-56 z-10 min-w-20 bg-base-100">
            <Skeleton className="h-4 w-10" />
          </th>
          {HARI_JADWAL.map((hari) => (
            <th key={hari} className="min-w-40">
              <Skeleton className="h-4 w-16" />
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Array.from({ length: PLACEHOLDER_ROWS }, (_, index) => (
          <tr key={index}>
            {index % 3 === 0 && (
              <td
                rowSpan={3}
                className="sticky left-0 z-10 w-56 min-w-56 max-w-56 bg-base-100 align-middle"
              >
                <Skeleton className="h-4 w-4/5" />
              </td>
            )}
            <td className="sticky left-56 z-10 bg-base-100">
              <Skeleton className="h-6 w-10" />
            </td>
            {HARI_JADWAL.map((hari, dayIndex) => (
              <td key={hari}>
                {dayIndex === index % HARI_JADWAL.length && (
                  <Skeleton className="h-7 w-full max-w-32" />
                )}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
