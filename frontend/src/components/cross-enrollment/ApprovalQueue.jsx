import { useState } from "react";
import { Check, X } from "lucide-react";
import { DataTable } from "../common/DataTable";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { Modal } from "../ui/Modal";
import { Textarea } from "../ui/Textarea";
import { Can } from "../auth/Can";
import {
  approvalStatusLabel,
  approvalStatusTone,
  formatDateTime,
  hostProgram,
  participantName,
  participantNiu,
  participantProgram,
} from "../../utils/crossEnrollment";

/**
 * Antrean pengajuan mata kuliah lintas program studi untuk dosen PA.
 * `resource` menunjuk endpoint daftar, `statusFilter` mengunci status awal.
 */
export const ApprovalQueue = ({ resource, statusFilter, title, mutations }) => {
  const [rejecting, setRejecting] = useState(null);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const closeReject = () => {
    setRejecting(null);
    setReason("");
    setError("");
  };

  const confirmReject = () => {
    if (reason.trim().length < 3) {
      setError("Alasan minimal 3 karakter.");
      return;
    }
    mutations.reject(rejecting, reason.trim());
    closeReject();
  };

  return (
    <Card title={title}>
      <DataTable
        resource={resource}
        tableKey={`${resource}_`}
        extraFilter={{ cross_enrollment_status: statusFilter }}
        rowKey={(row) => row.id}
        searchPlaceholder="Cari mahasiswa atau mata kuliah..."
        columns={[
          {
            key: "mahasiswa_id",
            header: "Mahasiswa",
            render: (row) => (
              <div>
                <div className="font-medium">{participantName(row)}</div>
                <div className="text-xs text-base-content/60">
                  {participantNiu(row)} · {participantProgram(row)}
                </div>
              </div>
            ),
          },
          {
            key: "kelas_id",
            header: "Mata Kuliah",
            render: (row) => (
              <div>
                <div className="font-medium">
                  {row.kelas?.matakuliah?.kode_matakuliah} —{" "}
                  {row.kelas?.matakuliah?.nama_resmi}
                </div>
                <div className="text-xs text-base-content/60">
                  {row.kelas?.nama} · {hostProgram(row)}
                </div>
              </div>
            ),
          },
          {
            key: "cross_enrollment_status",
            header: "Status",
            render: (row) => (
              <span
                className={`badge badge-sm ${approvalStatusTone(row.cross_enrollment_status)}`}
              >
                {approvalStatusLabel(row.cross_enrollment_status)}
              </span>
            ),
          },
          {
            key: "createdAt",
            header: "Diajukan",
            sortable: true,
            render: (row) => formatDateTime(row.createdAt),
          },
          {
            header: "Aksi",
            className: "text-right",
            cellClassName: "text-right",
            render: (row) => (
              <Can I="approve-pa" a="CrossEnrollment">
                {row.cross_enrollment_status === "pending_pa" ? (
                  <div className="flex justify-end gap-2">
                    <Button
                      size="xs"
                      className="gap-1"
                      disabled={mutations.isPending}
                      onClick={() => mutations.approve(row.id)}
                    >
                      <Check size={14} /> Setujui
                    </Button>
                    <Button
                      size="xs"
                      variant="error"
                      className="gap-1"
                      disabled={mutations.isPending}
                      onClick={() => setRejecting(row.id)}
                    >
                      <X size={14} /> Tolak
                    </Button>
                  </div>
                ) : (
                  <span className="text-xs text-base-content/50">
                    Sudah diproses
                  </span>
                )}
              </Can>
            ),
          },
        ]}
      />

      <Modal
        open={Boolean(rejecting)}
        onClose={closeReject}
        title="Tolak Pengajuan Lintas Prodi"
        subtitle="Alasan penolakan akan terlihat oleh mahasiswa."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={closeReject}>
              Batal
            </Button>
            <Button
              variant="error"
              isLoading={mutations.isPending}
              onClick={confirmReject}
            >
              Tolak Pengajuan
            </Button>
          </>
        }
      >
        <Textarea
          label="Alasan penolakan"
          value={reason}
          error={error}
          rows={3}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Contoh: mata kuliah ini wajib ditempuh di program studi asal."
        />
      </Modal>
    </Card>
  );
};
