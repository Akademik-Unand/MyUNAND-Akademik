import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Building2 } from "lucide-react";
import { MasterListPage } from "../../components/master/MasterListPage";
import { UserForm } from "../../components/iam/UserForm";
import { UserUnitsModal } from "../../components/iam/UserUnitsModal";
import { IconButton } from "../../components/common/IconButton";
import { Can } from "../../components/auth/Can";
import { assignUserRoles } from "../../services/api";
import { useResourceItem, useResourceQuery } from "../../hooks/useResourceQuery";
import { useCan } from "../../hooks/useCan";
import { ROLE_LABELS, roleLabel } from "../../constants/roles";
import { programStudiLabel } from "../../helpers/academicLabel";

const unitLabel = (unit) => {
  if (!unit) return null;
  const program = unit.programStudi || unit.program_studi;
  // Prodi memakai nama singkat (sudah memuat jenjang, mis. "S1 SI"); unit lain
  // memakai nama resmi yang sudah memuat kata Fakultas/Departemen.
  if (program) {
    return programStudiLabel(
      {
        nama_singkat: program.nama_singkat,
        kode_prodi: program.kode_prodi || program.kode,
      },
      null,
    );
  }
  if (unit.departemen?.nama) return unit.departemen.nama;
  if (unit.fakultas?.nama) return unit.fakultas.nama;
  return null;
};

const organizationLabel = (unit) =>
  unit?.nama_resmi || unit?.nama_singkat || unit?.kode_departemen || unit?.kode_fakultas || null;

const unitsLabel = (row) => {
  const labels = (row?.units || []).map(unitLabel).filter(Boolean);
  if (labels.length) return labels.join("; ");
  const profile = row?.mahasiswa || row?.dosen;
  if (!profile) return "Tidak ada unit organisasi";
  const program = profile.programStudi;
  return [
    programStudiLabel(program, null),
    organizationLabel(program?.departemen),
    organizationLabel(program?.fakultas),
  ].filter(Boolean).join(" · ") || "Afiliasi akademik belum tersedia";
};

export const UsersPage = () => {
  const [unitsTarget, setUnitsTarget] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const can = useCan();
  const mahasiswaId = searchParams.get("createMahasiswa");
  const dosenId = searchParams.get("createDosen");
  const mahasiswaQuery = useResourceItem("mahasiswa", mahasiswaId);
  const dosenQuery = useResourceItem("dosen", dosenId);
  const rolesQuery = useResourceQuery("roles", { enabled: Boolean(mahasiswaId || dosenId) });
  const profile = mahasiswaId ? mahasiswaQuery.data : dosenQuery.data;
  const profileRoleName = mahasiswaId ? "mahasiswa" : dosenId ? "dosen" : null;
  const profileRole = rolesQuery.data?.find((role) => role.name === profileRoleName);
  const autoCreateAllowed = Boolean(
    profile && !profile.user_id && profileRole && can("create", "User"),
  );
  const accountInitialValues = profileRole ? {
    name: profile?.nama || "",
    email: "",
    password: "",
    roleIds: [profileRole.id],
    dosen_id: dosenId || "",
    mahasiswa_id: mahasiswaId || "",
  } : undefined;
  const closeContext = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("createMahasiswa");
    next.delete("createDosen");
    setSearchParams(next, { replace: true });
  };

  return (
    <>
      <MasterListPage
        title="Pengguna"
        subtitle="Kelola akun dan peran untuk seluruh unit organisasi"
        breadcrumbs={[{ label: "Pengguna & Akses" }, { label: "Pengguna" }]}
        subject="User"
        resource="users"
        detailResource="users"
        detailId={searchParams.get("detailId")}
        onCloseDetail={() => {
          const next = new URLSearchParams(searchParams);
          next.delete("detailId");
          setSearchParams(next, { replace: true });
        }}
        autoOpenCreate={autoCreateAllowed}
        autoCreateKey={autoCreateAllowed ? `${profileRoleName}:${profile.id}` : null}
        createInitialValues={accountInitialValues}
        idKey="id"
        FormComponent={UserForm}
        emptyForm={{ name: "", email: "", password: "", roleIds: [], dosen_id: "", mahasiswa_id: "" }}
        afterSave={async (saved, values, mode) => {
          if (mode === "create") closeContext();
          if (mode !== "edit") return;
          const roleIds =
            values.roleIds || (values.roles || []).map((role) => role.id);
          if (saved?.id) await assignUserRoles(saved.id, roleIds);
        }}
        transformPayload={(payload, { mode }) => {
          const { roleIds, ...account } = payload;
          return mode === "create" ? { ...account, role_ids: roleIds || [] } : account;
        }}
        rowKey={(row) => row.id}
        searchPlaceholder="Cari nama atau email..."
        rowActionExtra={(row) => (
          <Can I="assign-units" a="User">
            <IconButton
              label="Atur unit organisasi"
              icon={Building2}
              tone="text-info"
              tooltipPosition="tooltip-left"
              onClick={() => setUnitsTarget(row)}
            />
          </Can>
        )}
        columns={[
          { key: "name", header: "Nama", sortable: true },
          { key: "email", header: "Email", sortable: true },
          {
            key: "role",
            header: "Peran Utama",
            filter: {
              type: "select",
              options: Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
            },
            render: (row) =>
              (row.roles || [])
                .map((role) => roleLabel(role.name))
                .join(", ") ||
              roleLabel(row.role) ||
              "—",
          },
          { key: "units", header: "Unit/Afiliasi", render: unitsLabel },
        ]}
        detailItems={(row) => [
          { label: "INFORMASI AKUN", value: "" },
          { label: "Nama", value: row.name },
          { label: "Email", value: row.email },
          { label: "Status Akun", value: "Aktif" },
          {
            label: "ROLE",
            value:
              (row.roles || [])
                .map((role) => roleLabel(role.name))
                .join(", ") || roleLabel(row.role),
          },
          { label: "Unit/Afiliasi", value: unitsLabel(row) },
          ...(row.mahasiswa ? [
            { label: "DATA MAHASISWA", value: "" },
            { label: "NIM/NIU", value: row.mahasiswa.niu },
            { label: "Nama", value: row.mahasiswa.nama },
            { label: "Angkatan", value: row.mahasiswa.angkatan },
            { label: "Program Studi", value: programStudiLabel(row.mahasiswa.programStudi) },
            { label: "Departemen/Jurusan", value: organizationLabel(row.mahasiswa.programStudi?.departemen) || "—" },
            { label: "Fakultas", value: organizationLabel(row.mahasiswa.programStudi?.fakultas) || "—" },
            { label: "Navigasi", value: <Link className="btn btn-ghost btn-xs" to={`/master/mahasiswa?detailId=${row.mahasiswa.id}`}>Lihat Data Mahasiswa</Link> },
          ] : []),
          ...(row.dosen ? [
            { label: "DATA DOSEN", value: "" },
            { label: "NIP", value: row.dosen.nip },
            { label: "Nama", value: row.dosen.nama },
            { label: "NIDN", value: row.dosen.nidn },
            { label: "Program Studi", value: programStudiLabel(row.dosen.programStudi) },
            { label: "Departemen/Jurusan", value: organizationLabel(row.dosen.programStudi?.departemen) || "—" },
            { label: "Fakultas", value: organizationLabel(row.dosen.programStudi?.fakultas) || "—" },
            { label: "Navigasi", value: <Link className="btn btn-ghost btn-xs" to={`/master/dosen?detailId=${row.dosen.id}`}>Lihat Data Dosen</Link> },
          ] : []),
          ...(can("read", "Role") ? [
            { label: "PERMISSION EFEKTIF", value: (row.permissions || []).join(", ") || "—" },
          ] : []),
        ]}
      />
      <UserUnitsModal
        target={unitsTarget}
        onClose={() => setUnitsTarget(null)}
      />
    </>
  );
};
