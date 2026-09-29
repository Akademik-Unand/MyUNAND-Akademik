import { useMemo, useState } from "react";
import { flattenSumber } from "../../helpers/nilaiCsv";

const EMPTY_GROUPS = [];

const matchesSearch = (row, search) => {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    String(row.niu || "")
      .toLowerCase()
      .includes(q) ||
    String(row.nama || "")
      .toLowerCase()
      .includes(q)
  );
};

const formatScore = (value) => {
  if (value === null || value === undefined || value === "") return "";
  return value;
};

export const NilaiPesertaMatrix = ({
  data,
  editable = false,
  savingStudentId = null,
  onSaveStudent,
}) => {
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState({});
  const groups = data?.groups || EMPTY_GROUPS;
  const sources = useMemo(() => flattenSumber(groups), [groups]);
  const assessment = data?.assessment;
  const peserta = useMemo(
    () => (data?.peserta || []).filter((row) => matchesSearch(row, search)),
    [data?.peserta, search],
  );
  const colSpan = groups.reduce(
    (sum, group) => sum + (group.sumber?.length || 0),
    0,
  );

  const saveRow = async (row) => {
    const values = drafts[row.krs_detil_id] || {};
    const items = sources.flatMap((source) => {
      const previous = row.nilai?.[source.id] == null ? null : Number(row.nilai[source.id]);
      const raw = values[source.id] ?? (previous == null ? "" : String(previous));
      const next = raw === "" ? null : Number(raw);
      if (next === previous) return [];
      return [{ krs_detil_id: row.krs_detil_id, sumber_penilaian_id: source.id, nilai: next }];
    });
    if (!items.length) return;
    const saved = await onSaveStudent?.({ krs_detil_id: row.krs_detil_id, nama: row.nama, items });
    if (saved) {
      setDrafts((current) => {
        const next = { ...current };
        delete next[row.krs_detil_id];
        return next;
      });
    }
  };

  const rowHasChanges = (row) => sources.some((source) => {
    const previous = row.nilai?.[source.id] == null ? null : Number(row.nilai[source.id]);
    const raw = drafts[row.krs_detil_id]?.[source.id] ?? (previous == null ? "" : String(previous));
    const next = raw === "" ? null : Number(raw);
    return next !== previous;
  });
  const rowHasInvalidScore = (row) => sources.some((source) => {
    const raw = drafts[row.krs_detil_id]?.[source.id];
    if (raw == null || raw === "") return false;
    const score = Number(raw);
    return !Number.isFinite(score) || score < 0 || score > 100;
  });

  return (
    <div className="space-y-3">
      {assessment?.ready === false && (
        <div role="alert" className="alert alert-warning items-start text-sm">
          <div>
            <p className="font-semibold">Nilai belum bisa diinput.</p>
            <p className="mt-1">Lengkapi sumber penilaian, bobot, dan pemetaan CPMK ke CPL terlebih dahulu.</p>
            {assessment.errors?.length > 0 && (
              <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
                {assessment.errors.map((error) => <li key={error}>{error}</li>)}
              </ul>
            )}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="font-medium">Nilai Peserta Kelas</h4>
        <input
          type="search"
          className="input input-sm w-64 max-w-full"
          placeholder="Cari NIM atau nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="table table-xs table-pin-rows w-full border-collapse">
          <thead>
            <tr className="text-xs uppercase text-base-content/60">
              <th rowSpan={groups.length ? 3 : 1} className="align-bottom">
                #
              </th>
              <th rowSpan={groups.length ? 3 : 1} className="align-bottom">
                NIM
              </th>
              <th rowSpan={groups.length ? 3 : 1} className="align-bottom">
                Nama Mahasiswa
              </th>
              {groups.map((group) => (
                <th
                  key={group.id}
                  colSpan={group.sumber.length}
                  className="text-center"
                >
                  {group.nama}
                </th>
              ))}
              <th
                rowSpan={groups.length ? 3 : 1}
                className="align-bottom bg-info/10"
              >
                Nilai Angka
              </th>
              <th
                rowSpan={groups.length ? 3 : 1}
                className="align-bottom bg-info/10"
              >
                Nilai Huruf
              </th>
              {editable && <th rowSpan={groups.length ? 3 : 1} className="align-bottom">Aksi</th>}
            </tr>
            {groups.length > 0 && (
              <>
                <tr className="text-xs text-base-content/60">
                  {groups.map((group) => (
                    <th
                      key={`${group.id}-scp`}
                      colSpan={group.sumber.length}
                      className="text-center font-normal"
                    >
                      {group.scp_label}
                    </th>
                  ))}
                </tr>
                <tr className="text-xs text-base-content/60">
                  {groups.flatMap((group) =>
                    group.sumber.map((item) => (
                      <th
                        key={item.id}
                        className="text-center font-normal min-w-16"
                      >
                        <div>{item.nama}</div>
                        <div className="text-info">Bobot {item.bobot}%</div>
                      </th>
                    )),
                  )}
                </tr>
              </>
            )}
          </thead>
          <tbody>
            {peserta.length === 0 ? (
              <tr>
                <td
                  colSpan={5 + colSpan + (editable ? 1 : 0)}
                  className="text-center text-base-content/60 py-8"
                >
                  Tidak ada peserta.
                </td>
              </tr>
            ) : (
              peserta.map((row, idx) => (
                <tr key={row.krs_detil_id}>
                  <td>{idx + 1}</td>
                  <td className="whitespace-nowrap">{row.niu || "—"}</td>
                  <td className="whitespace-nowrap font-medium">
                    {row.nama || "—"}
                  </td>
                  {groups.flatMap((group) =>
                    group.sumber.map((item) => (
                      <td key={item.id} className="text-center">
                        {editable ? (
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            className="input input-xs w-20 text-center"
                            aria-label={`${item.nama} untuk ${row.nama}`}
                            value={drafts[row.krs_detil_id]?.[item.id] ?? (row.nilai?.[item.id] == null ? "" : String(row.nilai[item.id]))}
                            onChange={(event) => setDrafts((current) => ({
                              ...current,
                              [row.krs_detil_id]: {
                                ...(current[row.krs_detil_id] || {}),
                                [item.id]: event.target.value,
                              },
                            }))}
                          />
                        ) : formatScore(row.nilai?.[item.id])}
                      </td>
                    )),
                  )}
                  <td className="text-center bg-info/10">
                    {row.nilai_angka ?? ""}
                  </td>
                  <td className="text-center bg-info/10">
                    {row.nilai_huruf ?? ""}
                  </td>
                  {editable && (
                    <td>
                      <button
                        type="button"
                        className="btn btn-primary btn-xs"
                        disabled={savingStudentId != null || !rowHasChanges(row) || rowHasInvalidScore(row)}
                        onClick={() => saveRow(row)}
                      >
                        {savingStudentId === row.krs_detil_id ? "Menyimpan..." : "Simpan"}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
