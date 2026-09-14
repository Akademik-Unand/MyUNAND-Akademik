import { useState } from "react";
import { Building2 } from "lucide-react";
import { MasterListPage } from "../../components/master/MasterListPage";
import { UserForm } from "../../components/iam/UserForm";
import { UserUnitsModal } from "../../components/iam/UserUnitsModal";
import { IconButton } from "../../components/common/IconButton";
import { Can } from "../../components/auth/Can";
import { assignUserRoles } from "../../services/api";
import { roleLabel } from "../../constants/roles";
import { programStudiLabel } from "../../helpers/academicLabel";

const unitLabel = (unit) => {
  if (!unit) return null;
  // Prodi memakai nama singkat (sudah memuat jenjang, mis. "S1 SI"); unit lain
  // memakai nama resmi yang sudah memuat kata Fakultas/Departemen.
  if (unit.programStudi) {
    return programStudiLabel(
      {
        nama_singkat: unit.programStudi.nama_singkat,
        kode_prodi: unit.programStudi.kode,
      },
      null,
    );
  }
  if (unit.departemen?.nama) return unit.departemen.nama;
  if (unit.fakultas?.nama) return unit.fakultas.nama;
  return null;
};

const unitsLabel = (row) => {
  const labels = (row?.units || []).map(unitLabel).filter(Boolean);
  return labels.length ? labels.join("; ") : "—";
};

export const UsersPage = () => {
  const [unitsTarget, setUnitsTarget] = useState(null);

  return (
    <>
      <MasterListPage
        title="Pengguna"
        subtitle="Kelola akun dan peran untuk seluruh unit organisasi"
        breadcrumbs={[{ label: "Pengguna & Akses" }, { label: "Pengguna" }]}
        subject="User"
        resource="users"
        detailResource="users"
        idKey="id"
        FormComponent={UserForm}
        emptyForm={{ name: "", email: "", password: "", roleIds: [] }}
        afterSave={async (saved, values) => {
          const roleIds =
            values.roleIds || (values.roles || []).map((role) => role.id);
          if (saved?.id) await assignUserRoles(saved.id, roleIds);
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
            key: "roles",
            header: "Peran",
            render: (row) =>
              (row.roles || [])
                .map((role) => roleLabel(role.name))
                .join(", ") ||
              roleLabel(row.role) ||
              "—",
          },
          { key: "units", header: "Unit", render: unitsLabel },
        ]}
        detailItems={(row) => [
          { label: "Nama", value: row.name },
          { label: "Email", value: row.email },
          {
            label: "Peran",
            value:
              (row.roles || [])
                .map((role) => roleLabel(role.name))
                .join(", ") || roleLabel(row.role),
          },
          { label: "Unit", value: unitsLabel(row) },
        ]}
      />
      <UserUnitsModal
        target={unitsTarget}
        onClose={() => setUnitsTarget(null)}
      />
    </>
  );
};
