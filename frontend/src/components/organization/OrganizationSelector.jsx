import { useMemo, useState } from "react";
import { Check, ChevronDown, RefreshCw, Lock } from "lucide-react";
import { Select } from "../ui/Select";
import { Modal } from "../ui/Modal";
import { useOrganizationContext } from "../../contexts/OrganizationContext";
import { updateOrganizationDraft } from "../../helpers/organizationContext";

const same = (a, b) =>
  a.fakultasId === b.fakultasId &&
  a.departemenId === b.departemenId &&
  a.prodiId === b.prodiId;

export const OrganizationSelector = () => {
  const {
    context,
    setContext,
    label,
    rows,
    options,
    isLoading,
    isError,
    refetch,
    scoped,
  } = useOrganizationContext();
  const [draft, setDraft] = useState(context);
  const [open, setOpen] = useState(false);
  const [prevContext, setPrevContext] = useState(context);
  if (!same(context, prevContext)) {
    setPrevContext(context);
    setDraft(context);
  }

  const filtered = useMemo(
    () => ({
      departemen: options.departemen.filter((option) => {
        const row = rows.departemen.find(
          (item) => String(item.id) === option.value,
        );
        return (
          !draft.fakultasId || String(row?.fakultas_id) === draft.fakultasId
        );
      }),
      prodi: options.prodi.filter((option) => {
        const row = rows.prodi.find((item) => String(item.id) === option.value);
        const fakultasId = row?.fakultas_id || row?.departemen?.fakultas_id;
        return (
          (!draft.fakultasId || String(fakultasId) === draft.fakultasId) &&
          (!draft.departemenId ||
            String(row?.departemen_id) === draft.departemenId)
        );
      }),
    }),
    [draft, options, rows],
  );

  // Unit yang sudah ditetapkan (role ber-scope atau akun mahasiswa) — label
  // statis dengan ikon kunci, tanpa picker. Dicek sebelum status kosong supaya
  // mahasiswa (yang master unitnya memang tidak dimuat) tetap tampil prodinya.
  if (scoped) {
    return (
      <span
        className="flex min-w-0 items-center gap-1.5 px-1 text-xs text-base-content/70 sm:px-2"
        title={`Unit Anda: ${label} — sudah ditetapkan, tidak dapat diubah`}
      >
        <Lock size={12} className="shrink-0 opacity-50" />
        <span className="truncate max-w-32 sm:max-w-48">{label}</span>
      </span>
    );
  }

  if (isLoading)
    return (
      <div className="skeleton h-9 w-24 sm:w-44" aria-label="Memuat unit" />
    );
  if (isError)
    return (
      <button
        type="button"
        className="btn btn-ghost btn-sm gap-2"
        onClick={refetch}
      >
        <RefreshCw size={15} />{" "}
        <span className="hidden sm:inline">Muat unit</span>
      </button>
    );
  if (!rows.fakultas.length && !rows.departemen.length && !rows.prodi.length)
    return <span className="text-xs text-warning">Unit belum ditetapkan</span>;

  const close = () => {
    setDraft(context);
    setOpen(false);
  };

  const apply = () => {
    setContext(draft);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className="btn btn-ghost btn-sm max-w-64 gap-2 px-3"
        aria-label={`Unit: ${label}`}
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <span className="truncate text-xs">{label}</span>
        <ChevronDown size={13} className="shrink-0 opacity-60" />
      </button>

      <Modal
        open={open}
        onClose={close}
        title="Pilih unit"
        subtitle="Pilih fakultas, departemen, dan program studi untuk menentukan data yang ditampilkan."
        size="lg"
        footer={
          <div className="flex w-full justify-end gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={close}
            >
              Batal
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm gap-1.5"
              disabled={same(context, draft)}
              onClick={apply}
            >
              <Check size={15} /> Terapkan
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Select
            size="md"
            label="Fakultas"
            placeholder="Semua fakultas"
            options={options.fakultas}
            value={draft.fakultasId}
            onChange={(e) =>
              setDraft(
                updateOrganizationDraft(draft, "fakultasId", e.target.value),
              )
            }
          />
          <Select
            size="md"
            label="Departemen"
            placeholder="Semua departemen"
            options={filtered.departemen}
            value={draft.departemenId}
            onChange={(e) =>
              setDraft(
                updateOrganizationDraft(draft, "departemenId", e.target.value),
              )
            }
            disabled={!draft.fakultasId}
          />
          <Select
            size="md"
            label="Program studi"
            placeholder="Semua program studi"
            options={filtered.prodi}
            value={draft.prodiId}
            onChange={(e) =>
              setDraft(
                updateOrganizationDraft(draft, "prodiId", e.target.value),
              )
            }
            disabled={!draft.departemenId}
          />
        </div>
        <p className="mt-4 text-xs text-base-content/60">
          Unit aktif akan tampil di navbar dan hanya mengatur data yang sedang
          dilihat, bukan mengubah hak akses.
        </p>
      </Modal>
    </>
  );
};
