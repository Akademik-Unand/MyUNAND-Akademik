import { Badge } from "../ui/Badge";

/** Daftar SCP (beserta CP induknya) yang mendukung sebuah CPMK/Sub-CPMK. */
const ScpList = ({ items = [] }) => {
  if (!items.length) return null;
  return (
    <ul className="mt-1.5 space-y-1">
      {items.map((scp) => (
        <li key={scp.id} className="text-xs text-base-content/70">
          <span className="font-medium text-base-content/80">
            {scp.nama_scp || "SCP"}
          </span>
          {scp.cp?.nama_cp && (
            <span className="text-base-content/50"> · {scp.cp.nama_cp}</span>
          )}
          {scp.deskripsi && (
            <p className="text-base-content/60">{scp.deskripsi}</p>
          )}
        </li>
      ))}
    </ul>
  );
};

/**
 * Tampilan read-only CPMK beserta Sub-CPMK (bila ada) dan SCP pendukungnya.
 * Dipakai lintas halaman; bentuk datanya sama dengan hasil katalog penawaran
 * (`matakuliah.cpmk` -> `subCpmk` -> `scp` -> `cp`).
 */
export const CpmkOutline = ({ cpmk = [] }) => {
  if (!cpmk.length) {
    return (
      <p className="text-sm text-base-content/60">
        Mata kuliah ini belum memiliki CPMK.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {cpmk.map((item, index) => (
        <div key={item.id} className="rounded-box border border-base-300 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="font-semibold">
                {item.nama_cpmk || `CPMK ${index + 1}`}
              </p>
              {item.deskripsi && item.deskripsi !== item.nama_cpmk && (
                <p className="text-sm text-base-content/70">{item.deskripsi}</p>
              )}
            </div>
            <Badge variant="neutral" size="xs">
              CPMK
            </Badge>
          </div>

          <ScpList items={item.scp} />

          {item.subCpmk?.length > 0 && (
            <div className="mt-3 border-l-2 border-primary/30 pl-3">
              <p className="text-[11px] font-medium uppercase tracking-wide text-base-content/50">
                Sub-CPMK ({item.subCpmk.length})
              </p>
              <div className="mt-1.5 space-y-2">
                {item.subCpmk.map((sub) => (
                  <div key={sub.id}>
                    <p className="text-sm font-medium">
                      {sub.nama_cpmk || "Sub-CPMK"}
                    </p>
                    {sub.deskripsi && sub.deskripsi !== sub.nama_cpmk && (
                      <p className="text-xs text-base-content/70">
                        {sub.deskripsi}
                      </p>
                    )}
                    <ScpList items={sub.scp} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
