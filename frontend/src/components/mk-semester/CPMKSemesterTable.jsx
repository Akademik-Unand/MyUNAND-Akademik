import { MAX_MK_BOBOT, totalBobotMataKuliah } from "../../helpers/cpmkBobot";

export const CPMKSemesterTable = ({ items = [] }) => {
  const totalBobot = totalBobotMataKuliah(items);
  const overMax = totalBobot > MAX_MK_BOBOT;
  const byId = new Map(items.map((item) => [item.id, item]));
  const childrenByParent = new Map();
  items.forEach((item) => {
    if (!item.parent_cpmk_id) return;
    const children = childrenByParent.get(item.parent_cpmk_id) || [];
    children.push(item);
    childrenByParent.set(item.parent_cpmk_id, children);
  });
  const roots = items.filter((item) => !item.parent_cpmk_id);

  const leafRows = (item) => {
    const children = childrenByParent.get(item.id) || item.subCpmk || [];
    if (!children.length) return [{ cpmk: item, leaf: item }];
    return children.flatMap((child) => leafRows(byId.get(child.id) || child));
  };

  return (
    <div className="overflow-x-auto">
      <table className="table table-sm w-full">
        <thead>
          <tr className="text-xs uppercase text-base-content/60">
            <th>CPMK</th>
            <th>Sub-CPMK</th>
            <th>Deskripsi</th>
            <th>Sumber Nilai</th>
            <th>Bobot</th>
          </tr>
        </thead>
        <tbody>
          {roots.map((item) => {
            const hierarchyRows = leafRows(item);
            const rowCount = hierarchyRows.reduce(
              (count, entry) => count + Math.max(entry.leaf.sumberPenilaian?.length || 0, 1),
              0,
            );
            let first = true;
            return hierarchyRows.flatMap(({ cpmk, leaf }) => {
              const sources = leaf.sumberPenilaian?.length
                ? leaf.sumberPenilaian
                : [{ id: "empty", nama_sumber_penilaian: "—", bobot: 0 }];
              return sources.map((source, index) => {
                const isFirst = first;
                first = false;
                return (
                  <tr key={`${item.id}-${leaf.id}-${source.id}`}>
                    {isFirst && (
                      <td rowSpan={rowCount} className="align-top font-semibold">
                        {item.nama_cpmk}
                        {item.deskripsi && <p className="mt-1 font-normal text-base-content/60">{item.deskripsi}</p>}
                      </td>
                    )}
                    {index === 0 && (
                      <>
                        <td className={cpmk.id === item.id ? "text-base-content/50" : "font-medium"}>
                          {cpmk.id === item.id ? "—" : cpmk.nama_cpmk}
                        </td>
                        <td className="max-w-xs">{cpmk.id === item.id ? "" : cpmk.deskripsi}</td>
                      </>
                    )}
                    <td>{source.nama_sumber_penilaian}</td>
                    <td>{source.bobot}</td>
                  </tr>
                );
              });
            });
          })}
          <tr>
            <td colSpan={4} className="font-medium">
              Total Bobot
            </td>
            <td className={`font-medium ${overMax ? "text-error" : ""}`}>
              {totalBobot}% / {MAX_MK_BOBOT}%
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
