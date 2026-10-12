import { toast } from "sonner";
import { schedulingDownload } from "../services/penjadwalan.service";
export async function downloadSchedule(id, format = "csv", template = false) {
  try {
    const { blob } = await schedulingDownload(id, { format, template });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jadwal-${template ? "template" : id}.${format}`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (e) {
    toast.error(e.message);
  }
}
