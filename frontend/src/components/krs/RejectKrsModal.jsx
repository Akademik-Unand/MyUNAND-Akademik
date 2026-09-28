import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Textarea } from "../ui/Textarea";

export const RejectKrsModal = ({ target, onClose, onConfirm, isLoading }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  const submit = async () => {
    const value = reason.trim();
    if (value.length < 3) {
      setError("Alasan penolakan minimal 3 karakter.");
      return;
    }
    setError("");
    await onConfirm(value);
  };

  return (
    <Modal
      open={Boolean(target)}
      onClose={isLoading ? undefined : onClose}
      closeOnBackdrop={!isLoading}
      title="Tolak KRS"
      subtitle={target?.mahasiswa?.nama || "Mahasiswa"}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button variant="error" size="sm" onClick={submit} isLoading={isLoading}>
            Tolak KRS
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3 text-sm text-base-content/80">
          <AlertTriangle className="mt-0.5 shrink-0 text-error" size={18} />
          <p>
            Seluruh mata kuliah yang masih menunggu akan ditolak. Mahasiswa dapat
            melihat alasannya dan memperbaiki KRS selama periode masih terbuka.
          </p>
        </div>
        <Textarea
          label="Alasan penolakan"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          error={error}
          maxLength={1000}
          rows={4}
          placeholder="Tuliskan alasan yang dapat ditindaklanjuti mahasiswa"
          disabled={isLoading}
        />
      </div>
    </Modal>
  );
};
