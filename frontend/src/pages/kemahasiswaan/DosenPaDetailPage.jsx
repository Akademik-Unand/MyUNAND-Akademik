import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, UserRoundCog } from "lucide-react";
import { Can } from "../../components/auth/Can";
import { DataTable } from "../../components/common/DataTable";
import { PageHeader } from "../../components/common/PageHeader";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Modal } from "../../components/ui/Modal";
import { FormActions } from "../../components/common/FormActions";
import { TetapkanPaForm } from "../../components/bimbingan/TetapkanPaForm";
import { useBimbinganMutations } from "../../hooks/useBimbinganAkademik";
import { useResourceItem } from "../../hooks/useResourceQuery";
import { programStudiLabel } from "../../helpers/academicLabel";
import { mahasiswaLabel, unitLabel } from "../../helpers/bimbinganPa";

const emptyForm = { dosen_id: "", tahun_akademik: "", catatan: "" };

export const DosenPaDetailPage = () => {
  const { dosenId } = useParams();
  const dosenQuery = useResourceItem("dosen-pa", dosenId);
  const mutations = useBimbinganMutations();
  const [assignment, setAssignment] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [releaseTarget, setReleaseTarget] = useState(null);
  const dosen = dosenQuery.data;

  const openReassign = (row) => {
    setAssignment(row);
    setForm({ dosen_id: "", tahun_akademik: row.tahun_akademik || "", catatan: row.catatan || "" });
  };

  const submitReassign = async (event) => {
    event.preventDefault();
    if (!assignment || !form.dosen_id) return;
    await mutations.update.mutateAsync({
      id: assignment.id,
      payload: {
        dosen_id: form.dosen_id,
        tahun_akademik: form.tahun_akademik.trim() || null,
        catatan: form.catatan.trim() || null,
      },
    });
    setAssignment(null);
  };

  if (dosenQuery.isPending) return <div className="p-4 text-sm text-base-content/60">Memuat data Dosen PA...</div>;
  if (dosenQuery.isError || !dosen) return <div className="p-4 text-sm text-error">{dosenQuery.error?.message || "Data Dosen PA tidak ditemukan atau di luar kewenangan Anda."}</div>;

  const columns = [
    {
      header: "Mahasiswa",
      render: (row) => <div><p className="font-medium">{row.mahasiswa?.nama || "—"}</p><p className="text-xs text-base-content/60">{row.mahasiswa?.niu || "—"} · Angkatan {row.mahasiswa?.angkatan || "—"}</p></div>,
    },
    { header: "Program Studi", render: (row) => unitLabel(row.mahasiswa) },
    { key: "tahun_akademik", header: "Tahun PA", render: (row) => row.tahun_akademik || "—" },
    {
      header: "Status KRS",
      render: (row) => row.krs ? <Badge variant={row.krs.status_persetujuan === "approved" ? "success" : row.krs.status_persetujuan === "rejected" ? "error" : "warning"}>{row.krs.status_persetujuan === "approved" ? "Disetujui" : row.krs.status_persetujuan === "rejected" ? "Ditolak" : "Menunggu"}</Badge> : <span className="text-base-content/60">Belum mengisi KRS</span>,
    },
    {
      header: "Aksi",
      className: "text-right",
      cellClassName: "text-right",
      render: (row) => <div className="flex justify-end gap-1">
        <Link className="btn btn-ghost btn-xs" to={`/master/mahasiswa?detailId=${row.mahasiswa_id}`}>Lihat Mahasiswa</Link>
        {row.krs?.status_persetujuan === "pending_pa" && <Can I="approve" a="Krs"><Link className="btn btn-primary btn-xs" to={`/perkuliahan/persetujuan/krs?mahasiswa_id=${row.mahasiswa_id}`}>Tinjau KRS</Link></Can>}
        <Can I="update" a="BimbinganAkademik"><Button size="xs" variant="ghost" aria-label="Ganti Dosen PA" title="Ganti Dosen PA" onClick={() => openReassign(row)}><UserRoundCog size={15} /></Button></Can>
        <Can I="delete" a="BimbinganAkademik"><Button size="xs" variant="ghost" aria-label="Lepas Dosen PA" title="Lepas Dosen PA" onClick={() => setReleaseTarget(row)}>Lepas</Button></Can>
      </div>,
    },
  ];

  return <div className="space-y-4">
    <PageHeader
      title={`Dosen PA · ${dosen.nama || dosen.nip || "Detail"}`}
      subtitle={`${dosen.nip || "Tanpa NIP"}${dosen.nidn ? ` · NIDN ${dosen.nidn}` : ""} · ${programStudiLabel(dosen.programStudi)}`}
      breadcrumbs={[{ label: "Kemahasiswaan" }, { label: "Dosen PA", href: "/kemahasiswaan/dosen-pa" }, { label: dosen.nama || "Detail" }]}
      action={<Link className="btn btn-ghost btn-sm gap-1" to="/kemahasiswaan/dosen-pa"><ArrowLeft size={15} /> Kembali</Link>}
    />
    <Card title="Profil dan Ringkasan Dosen PA">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div><p className="text-xs text-base-content/60">Program Studi</p><p className="text-sm font-medium">{programStudiLabel(dosen.programStudi)}</p></div>
        <div><p className="text-xs text-base-content/60">Departemen</p><p className="text-sm font-medium">{dosen.programStudi?.departemen?.nama_resmi || dosen.programStudi?.departemen?.nama_singkat || "—"}</p></div>
        <div><p className="text-xs text-base-content/60">Fakultas</p><p className="text-sm font-medium">{dosen.programStudi?.fakultas?.nama_resmi || dosen.programStudi?.fakultas?.nama_singkat || "—"}</p></div>
        <div><p className="text-xs text-base-content/60">Akun</p><p className="text-sm font-medium">{dosen.user?.email || "Belum memiliki akun"}</p><p className="text-xs text-base-content/60">{dosen.status_akun === "aktif" ? "Aktif" : dosen.status_akun === "nonaktif" ? "Nonaktif" : "Belum dibuat"}</p></div>
        <div><p className="text-xs text-base-content/60">Mahasiswa Bimbingan Aktif</p><p className="text-lg font-semibold">{dosen.jumlah_mahasiswa || 0}</p></div>
        <div><p className="text-xs text-base-content/60">KRS Menunggu</p><p className="text-lg font-semibold">{dosen.krs_menunggu || 0}</p></div>
      </div>
    </Card>
    <Card title="Mahasiswa Bimbingan Aktif">
      <DataTable resource="bimbingan-akademik" tableKey={`pa_${dosenId}_`} extraFilter={{ dosen_id: dosenId, status: "aktif" }} columns={columns} rowKey={(row) => row.id} searchPlaceholder="Cari nama atau NIM mahasiswa..." />
    </Card>

    <Modal open={Boolean(assignment)} onClose={() => !mutations.update.isPending && setAssignment(null)} title="Ganti Dosen PA" subtitle={assignment ? mahasiswaLabel(assignment.mahasiswa) : ""} closeOnBackdrop={!mutations.update.isPending} footer={<FormActions onCancel={() => setAssignment(null)} submitLabel="Simpan Perubahan" isLoading={mutations.update.isPending} onSubmitClick={() => document.getElementById("pa-reassign-form")?.requestSubmit()} />}>
      {assignment && <form id="pa-reassign-form" onSubmit={submitReassign}><TetapkanPaForm values={form} onChange={setForm} mahasiswa={assignment.mahasiswa} /></form>}
    </Modal>

    <Modal open={Boolean(releaseTarget)} onClose={() => !mutations.remove.isPending && setReleaseTarget(null)} title="Akhiri penugasan PA" subtitle="Riwayat penugasan tetap disimpan." closeOnBackdrop={!mutations.remove.isPending} footer={<div className="flex justify-end gap-2"><Button variant="ghost" size="sm" disabled={mutations.remove.isPending} onClick={() => setReleaseTarget(null)}>Batal</Button><Button variant="error" size="sm" isLoading={mutations.remove.isPending} onClick={async () => { if (!releaseTarget) return; await mutations.remove.mutateAsync(releaseTarget.id); setReleaseTarget(null); }}>Akhiri Penugasan</Button></div>}>
      <p className="text-sm text-base-content/80">Akhiri penugasan PA untuk {mahasiswaLabel(releaseTarget?.mahasiswa)}?</p>
    </Modal>
  </div>;
};
