import { Download } from "lucide-react";
import { Button } from "../ui/Button";
import { krsDocumentAvailability } from "../../utils/crossEnrollment";

/** Tombol final unduhan mengikuti status header dan semua baris KRS aktif. */
export const KrsDocumentDownload = ({ krs, rows, busy, onDownload }) => {
  const availability = krsDocumentAvailability(krs, rows);
  const disabled = !availability.available || busy;
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-box border border-base-300 bg-base-200/50 p-3">
      <p className="text-sm text-base-content/70">{availability.message}</p>
      <Button size="sm" variant="outline" disabled={disabled} isLoading={busy}
        aria-label="Unduh KRS sebagai PDF" onClick={onDownload}>
        <Download size={15} /> Unduh KRS
      </Button>
    </div>
  );
};