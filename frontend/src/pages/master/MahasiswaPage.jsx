import { Link, useSearchParams } from "react-router-dom";
import { Can } from "../../components/auth/Can";
import { MasterListPage } from "../../components/master/MasterListPage";
import { MahasiswaForm } from "../../components/master/MahasiswaForm";
import { useAcademicFilter } from "../../hooks/useAcademicFilter";
import { useFilterOptions } from "../../hooks/useFilterOptions";
import { programStudiLabel } from "../../helpers/academicLabel";

const emptyForm = {
  niu: "",
  nama: "",
  angkatan: "",
  program_studi_id: "",
  jenis_kelamin: "",
};

const validate = (values) => {
  if (!values.niu?.trim()) return "NIM/NIU wajib diisi.";
  if (!values.nama?.trim()) return "Nama wajib diisi.";
  return null;
};

export const MahasiswaPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const academic = useAcademicFilter({ keys: ["fakultas", "departemen", "prodi"], applyImmediately: true });
  const { prodi: prodiOptions } = useFilterOptions();

  return (
    <MasterListPage
      title="Mahasiswa"
      subtitle="Kelola data mahasiswa dan program studi akademiknya"
      breadcrumbs={[{ label: "Master Data" }, { label: "Mahasiswa" }]}
      subject="Mahasiswa"
      resource="mahasiswa"
      detailResource="mahasiswa"
      detailId={searchParams.get("detailId")}
      onCloseDetail={() => {
        const next = new URLSearchParams(searchParams);
        next.delete("detailId");
        setSearchParams(next, { replace: true });
      }}
      idKey="id"
      FormComponent={MahasiswaForm}
      emptyForm={emptyForm}
      createDefaults={{ program_studi_id: academic.applied.prodiId || "" }}
      extraFilter={academic.extraFilter}
      dataLocked={academic.locked}
      validate={validate}
      toolbarFilters={academic.fields}
      onApplyToolbarFilters={academic.apply}
      onResetToolbarFilters={academic.reset}
      toolbarFiltersDisabled={!academic.canApply}
      rowKey={(row) => row.id}
      searchPlaceholder="Cari nama atau NIM/NIU..."
      columns={[
        { key: "niu", header: "NIM/NIU", sortable: true },
        { key: "nama", header: "Nama", sortable: true },
        {
          key: "angkatan",
          header: "Angkatan",
          sortable: true,
          filter: { type: "text", placeholder: "Tahun angkatan" },
        },
        {
          key: "program_studi_id",
          header: "Program Studi",
          sortable: true,
          filter: { type: "select", options: prodiOptions },
          render: (row) => programStudiLabel(row.programStudi),
        },
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
          render: (row) => {
            const user = row.user;
            if (!user) return <span className="text-base-content/60">Belum memiliki akun</span>;
            return (
              <div className="min-w-36">
                <p className="max-w-48 truncate text-xs" title={user.email}>{user.email}</p>
                <span className={`badge badge-xs ${user.deletedAt ? "badge-ghost" : "badge-success"}`}>
                  {user.deletedAt ? "Nonaktif" : "Aktif"}
                </span>
              </div>
            );
          },
        },
      ]}
      detailItems={(row) => [
        { label: "NIM/NIU", value: row.niu },
        { label: "Nama", value: row.nama },
        { label: "Angkatan", value: row.angkatan },
        { label: "Jenis Kelamin", value: row.jenis_kelamin || "—" },
        { label: "Program Studi", value: programStudiLabel(row.programStudi, "—") },
        { label: "Departemen/Jurusan", value: row.programStudi?.departemen?.nama_resmi || row.programStudi?.departemen?.nama_singkat || "—" },
        { label: "Fakultas", value: row.programStudi?.fakultas?.nama_resmi || row.programStudi?.fakultas?.nama_singkat || "—" },
        {
          label: "Dosen PA",
          value: row.bimbinganAkademik?.[0]?.dosen?.nama || "Belum ditetapkan",
        },
        {
          label: "Status Akun",
          value: row.user ? (row.user.deletedAt ? "Nonaktif" : "Aktif") : "Belum memiliki akun",
        },
        { label: "Email/Username", value: row.user?.email || "—" },
        {
          label: "Aksi Akun",
          value: row.user ? (
            <Link className="btn btn-ghost btn-xs" to={`/pengaturan/pengguna?detailId=${row.user.id}`}>Lihat Akun</Link>
          ) : (
            <Can I="create" a="User">
              <Link className="btn btn-ghost btn-xs" to={`/pengaturan/pengguna?createMahasiswa=${row.id}`}>Buat Akun</Link>
            </Can>
          ),
        },
      ]}
    />
  );
};
