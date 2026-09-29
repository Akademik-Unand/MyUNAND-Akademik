import { Link } from "react-router-dom";
import { CalendarClock } from "lucide-react";
import { Can } from "../auth/Can";
import { periodeOperasiNotice } from "../../helpers/academicPeriod";

export const PeriodOperationNotice = ({ period, label, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="alert alert-info text-sm" role="status">
        Memeriksa periode {label}...
      </div>
    );
  }
  const notice = periodeOperasiNotice(period, label);
  if (!notice) return null;

  const color =
    notice.variant === "error"
      ? "alert-error"
      : notice.variant === "info"
        ? "alert-info"
        : "alert-warning";

  return (
    <div className={`alert ${color} items-start`} role="status">
      <CalendarClock size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="font-semibold">{notice.title}</p>
        <p className="text-sm">{notice.message}</p>
      </div>
      <Can any={[{ I: "create", a: "Periode" }, { I: "update", a: "Periode" }]}>
        <Link className="btn btn-sm btn-ghost" to="/master/semester/periode">
          Atur Periode
        </Link>
      </Can>
    </div>
  );
};
