import { useResourceQuery } from '../../hooks/useResourceQuery';

export const ScpPicker = ({ kurikulumId, value = [], onChange, required = false }) => {
  const query = useResourceQuery('kurikulum-cp', {
    params: kurikulumId ? { filter: { kurikulum_id: kurikulumId } } : {},
    enabled: Boolean(kurikulumId),
  });
  const cps = query.data || [];

  const toggle = (id) => {
    const next = new Set(value);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange([...next]);
  };

  if (!kurikulumId) {
    return (
      <p className="text-sm text-base-content/60">
        Buka halaman ini dari daftar CPMK setelah memilih kurikulum, supaya CP/SCP bisa dipilih.
      </p>
    );
  }

  if (query.isPending) {
    return <p className="text-sm text-base-content/60">Memuat CP dan SCP...</p>;
  }

  if (!cps.length) {
    return (
      <p className="text-sm text-base-content/60">
        Belum ada CP/SCP pada kurikulum ini. Tambah dulu di halaman CP Kurikulum.
      </p>
    );
  }

  return (
    <fieldset className="fieldset p-0 gap-2">
      <legend className="fieldset-legend text-xs font-medium text-base-content/80">
        CP / SCP terkait{required ? ' *' : ' (opsional)'}
      </legend>
      <p className="text-xs text-base-content/60">
        Pilih SCP di bawah CP yang terkait. Boleh lebih dari satu.
      </p>
      <div className="space-y-3 rounded-box border border-base-300 p-3">
        {cps.map((cp) => (
          <div key={cp.id} className="space-y-1">
            <p className="text-xs font-semibold text-base-content/80">{cp.nama_cp}</p>
            {(cp.scp || []).map((scp) => (
              <label key={scp.id} className="flex items-start gap-2 py-0.5">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary mt-0.5"
                  checked={value.includes(scp.id)}
                  onChange={() => toggle(scp.id)}
                />
                <span className="text-sm leading-snug">
                  {scp.nama_scp}
                  {scp.deskripsi ? ` — ${scp.deskripsi}` : ''}
                </span>
              </label>
            ))}
            {!(cp.scp || []).length && (
              <p className="text-xs text-base-content/50">Belum ada SCP pada CP ini.</p>
            )}
          </div>
        ))}
      </div>
    </fieldset>
  );
};
