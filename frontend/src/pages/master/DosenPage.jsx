import { Link, useSearchParams } from "react-router-dom";
import { Can } from "../../components/auth/Can";
import { MasterListPage } from "../../components/master/MasterListPage";
import { DosenForm } from "../../components/master/DosenForm";
import { useAcademicFilter } from "../../hooks/useAcademicFilter";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import { useResourceQuery } from "../../hooks/useResourceQuery";
import { programStudiLabel } from "../../helpers/academicLabel";

const emptyForm = {
  nip: "",
  program_studi_id: "",
  nama: "",
  nidn: "",
  nip_lama: "",
  nip_baru: "",
};

export const DosenPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const academic = useAcademicFilter({
    keys: ["fakultas", "departemen", "prodi"],
    applyImmediately: true,
  });
  const { prodi: prodiOptions } = useFilterOptions();
  const detailId = searchParams.get("detailId");
  const dpaSummary = useResourceQuery("dosen-pa", {
    params: { limit: 1, filter: { id: detailId } },
    enabled: Boolean(detailId),
  });

  return (
    <MasterListPage
      title="Dosen"
      subtitle="Kelola data dosen berdasarkan program studi"
      breadcrumbs={[{ label: "Master Data" }, { label: "Dosen" }]}
      subject="Dosen"
      resource="dosen"
      detailResource="dosen"
      detailId={searchParams.get("detailId")}
      onCloseDetail={() => {
        const next = new URLSearchParams(searchParams);
        next.delete("detailId");
        setSearchParams(next, { replace: true });
      }}
      idKey="id"
      FormComponent={DosenForm}
      emptyForm={emptyForm}
      createDefaults={{ program_studi_id: academic.applied.prodiId || "" }}
      extraFilter={academic.extraFilter}
      dataLocked={academic.locked}
      toolbarFilters={academic.fields}
      onApplyToolbarFilters={academic.apply}
      onResetToolbarFilters={academic.reset}
      toolbarFiltersDisabled={!academic.canApply}
      rowKey={(row) => row.id}
      searchPlaceholder="Cari nama, NIP, NIDN, atau email..."
      columns={[
        {
          key: "program_studi_id",
          header: "Program Studi",
          sortable: true,
          filter: { type: "select", options: prodiOptions },
          render: (row) => programStudiLabel(row.programStudi),
        },
        { key: "nip", header: "NIP", sortable: true },
        { key: "nama", header: "Nama", sortable: true },
        { key: "nidn", header: "NIDN", sortable: true },
        {
          key: "account_status",
          header: "Akun",
          filter: {
            type: "select",
            label: "Status Akun",
            options: [
              { value: "aktif", label: "Aktif" },
              { value: "nonaktif", label: "Nonaktif" },
              { value: "belum_ada", label: "Belum memiliki akun" },
            ],
          },
          render: (row) => row.user ? (
            <div className="min-w-36">
              <p className="max-w-48 truncate text-xs" title={row.user.email}>{row.user.email}</p>
              <span className={`badge badge-xs ${row.user.deletedAt ? "badge-ghost" : "badge-success"}`}>
                {row.user.deletedAt ? "Nonaktif" : "Aktif"}
              </span>
            </div>
          ) : <span className="text-base-content/60">Belum dibuat</span>,
        },
      ]}
      detailItems={(row) => [
        { label: "DATA DOSEN", value: "" },
        { label: "Program Studi", value: programStudiLabel(row.programStudi, "") },
        { label: "Departemen/Jurusan", value: row.programStudi?.departemen?.nama_resmi || row.programStudi?.departemen?.nama_singkat || "—" },
        { label: "Fakultas", value: row.programStudi?.fakultas?.nama_resmi || row.programStudi?.fakultas?.nama_singkat || "—" },
        { label: "NIP", value: row.nip },
        { label: "Nama", value: row.nama },
        { label: "NIDN", value: row.nidn },
        { label: "NIP Lama", value: row.nip_lama },
        { label: "NIP Baru", value: row.nip_baru },
        { label: "AKUN", value: "" },
        { label: "Email/Username", value: row.user?.email || "Belum memiliki akun" },
        { label: "Status Akun", value: row.user ? (row.user.deletedAt ? "Nonaktif" : "Aktif") : "Belum dibuat" },
        {
          label: "Aksi Akun",
          value: row.user ? (
            <Link className="btn btn-ghost btn-xs" to={`/pengaturan/pengguna?detailId=${row.user.id}`}>Lihat Akun</Link>
          ) : (
            <Can I="create" a="User">
              <Link className="btn btn-ghost btn-xs" to={`/pengaturan/pengguna?createDosen=${row.id}`}>Buat Akun</Link>
            </Can>
          ),
        },
        ...(row.bimbinganAkademik?.some((item) => item.status === "aktif")
          ? [{
              label: "Bimbingan Akademik",
              value: <div className="space-y-1"><p>{dpaSummary.data?.[0]?.jumlah_mahasiswa ?? row.bimbinganAkademik.length} mahasiswa bimbingan · {dpaSummary.data?.[0]?.krs_menunggu ?? "—"} KRS menunggu</p><Can I="read" a="BimbinganAkademik"><Link className="btn btn-ghost btn-xs" to={`/kemahasiswaan/dosen-pa/${row.id}`}>Lihat Bimbingan</Link></Can></div>,
            }]
          : []),
      ]}
    />
  );
};
