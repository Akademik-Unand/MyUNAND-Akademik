import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/ui/Card";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { FormActions } from "../../components/common/FormActions";
import { ConfirmDeleteModal } from "../../components/common/ConfirmDeleteModal";
import { PageSkeleton } from "../../components/common/PageSkeleton";
import { JadwalGrid } from "../../components/jadwal/JadwalGrid";
import { useResourceQuery } from "../../hooks/useResourceQuery";
import { useResourceMutations } from "../../hooks/useResourceMutations";
import { useCan } from "../../hooks/useCan";
import { useOrgContext } from "../../hooks/useOrgContext";
import {
  analisisRuang,
  formatJam,
  jamOverlap,
  KONFLIK_LABEL,
  deteksiKonflikJadwal,
} from "../../helpers/jadwal";
import { kelasDisplayName } from "../../helpers/kelasInfo";
import { semesterAkademikLabel } from "../../helpers/semesterProdi";
import { filterProdiByScope } from "../../helpers/organizationContext";

const ruangLabel = (ruang) => {
  if (!ruang) return "Ruang";
  const nama = `${ruang.kode || ""} ${ruang.nama || ""}`.trim() || "Ruang";
  return ruang.kapasitas ? `${nama} · kapasitas ${ruang.kapasitas}` : nama;
};

const bandingkanSemester = (a, b) => {
  if (a.is_aktif !== b.is_aktif) return a.is_aktif ? -1 : 1;
  return 0;
};

export const JadwalRuangPage = () => {
  const client = useQueryClient();
  const can = useCan();

  const org = useOrgContext();
  const prodiList = useMemo(
    () =>
      filterProdiByScope(org.rows?.prodi, {
        fakultasId: org.fakultasId,
        departemenId: org.departemenId,
        prodiId: org.prodiId,
        scoped: org.scoped,
      }),
    [org.rows, org.scoped, org.prodiId, org.departemenId, org.fakultasId],
  );

  // Pilihan program studi mengikuti filter unit global (selector di header).
  const [prodiId, setProdiId] = useState("");
  const activeProdiId = prodiList.some((row) => row.id === prodiId)
    ? prodiId
    : prodiList.some((row) => row.id === org.prodiId)
      ? org.prodiId
      : prodiList[0]?.id || "";

  // Saat filter unit global berubah, lepas pilihan lokal agar ikut menyesuaikan.
  const orgKey = `${org.fakultasId}|${org.departemenId}|${org.prodiId}`;
  const [prevOrgKey, setPrevOrgKey] = useState(orgKey);
  if (prevOrgKey !== orgKey) {
    setPrevOrgKey(orgKey);
    setProdiId("");
  }

  const semesterProdiQuery = useResourceQuery("semester-prodi", {
    params: activeProdiId
      ? { filter: { program_studi_id: activeProdiId } }
      : undefined,
    enabled: Boolean(activeProdiId),
  });
  const semesterProdiList = [...(semesterProdiQuery.data || [])].sort(
    bandingkanSemester,
  );
  const [semesterProdiId, setSemesterProdiId] = useState("");
  const activeSemesterProdi =
    semesterProdiList.find((row) => row.id === semesterProdiId) ||
    semesterProdiList[0] ||
    null;
  const semesterProdiKey = activeSemesterProdi?.id || "";
  const activeProdi = prodiList.find((row) => row.id === activeProdiId) || null;
  const fakultasId =
    activeSemesterProdi?.programStudi?.fakultas_id ||
    activeProdi?.fakultas_id ||
    activeProdi?.departemen?.fakultas_id ||
    org.fakultasId ||
    "";

  const kelasQuery = useResourceQuery("kelas", {
    params: semesterProdiKey
      ? { filter: { semester_prodi_id: semesterProdiKey } }
      : undefined,
    enabled: Boolean(semesterProdiKey),
  });
  const kelasList = useMemo(() => kelasQuery.data || [], [kelasQuery.data]);

  // Ruang dipakai bersama, jadi ketersediaan dihitung dari SELURUH kelas pada
  // semester ini (bukan hanya prodi terpilih). Kalau belum termuat, pakai kelas
  // prodi terpilih sebagai perkiraan.
  const semesterId = activeSemesterProdi?.semester_id || "";
  const kelasSemesterQuery = useResourceQuery("kelas", {
    params: semesterId ? { filter: { semester_id: semesterId } } : undefined,
    enabled: Boolean(semesterId),
  });
  const kelasSemester = useMemo(
    () => kelasSemesterQuery.data || kelasList,
    [kelasSemesterQuery.data, kelasList],
  );

  const ruangQuery = useResourceQuery("ruang");
  const ruangList = useMemo(() => ruangQuery.data || [], [ruangQuery.data]);

  const shiftQuery = useResourceQuery("shift", {
    params: fakultasId ? { filter: { fakultas_id: fakultasId } } : undefined,
    enabled: Boolean(fakultasId),
  });
  const shiftList = shiftQuery.data || [];

  const konflik = useMemo(
    () => deteksiKonflikJadwal(kelasQuery.data || []),
    [kelasQuery.data],
  );

  const [modal, setModal] = useState(null);
  const [values, setValues] = useState({ shift_id: "", ruang_id: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const jadwalMutations = useResourceMutations("jadwal-kelas", {
    create: "Jadwal disimpan.",
    update: "Jadwal diperbarui.",
    remove: "Jadwal dihapus.",
  });

  const refresh = () => client.invalidateQueries({ queryKey: ["kelas"] });

  const openAdd = (kelas, hari) => {
    setValues({ shift_id: "", ruang_id: "" });
    setModal({ kelas, hari, jadwal: null });
  };

  const openEdit = (jadwal, kelas) => {
    setValues({
      shift_id: jadwal.shift_id || "",
      ruang_id: jadwal.ruang_id || "",
    });
    setModal({ kelas, hari: jadwal.hari, jadwal });
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!values.shift_id) return;
    const payload = {
      kelas_id: modal.kelas.id,
      shift_id: values.shift_id,
      ruang_id: values.ruang_id || null,
      hari: modal.hari,
    };
    if (modal.jadwal) {
      await jadwalMutations.update.mutateAsync({
        id: modal.jadwal.id,
        payload,
      });
    } else {
      await jadwalMutations.create.mutateAsync(payload);
    }
    refresh();
    setModal(null);
  };

  const konfirmasiHapus = async () => {
    await jadwalMutations.remove.mutateAsync(deleteTarget.id);
    refresh();
    setDeleteTarget(null);
  };

  const canCreate = can("create", "JadwalKelas");
  const canUpdate = can("update", "JadwalKelas");
  const canDelete = can("delete", "JadwalKelas");

  const shiftOptions = shiftList.map((row) => ({
    value: row.id,
    label: `${row.kode} (${formatJam(row.jam_mulai)}–${formatJam(row.jam_selesai)})`,
  }));

  const shiftTerpilih =
    shiftList.find((row) => row.id === values.shift_id) || null;

  // Kebutuhan ruang kelas yang sedang dijadwalkan; ruang yang kapasitasnya
  // kurang ditandai langsung di opsi supaya tidak baru ketahuan saat simpan.
  const kebutuhanKapasitas = Number(modal?.kelas?.jumlah_peserta_max || 0);
  const ruangTerlaluKecil = (ruang) =>
    kebutuhanKapasitas > 0 &&
    Number(ruang?.kapasitas || 0) > 0 &&
    Number(ruang.kapasitas) < kebutuhanKapasitas;

  // Ketersediaan ruang pada hari & jam yang sedang diisi, dihitung se-semester.
  const analisis = useMemo(
    () =>
      analisisRuang({
        ruangList,
        kelasSemester,
        kebutuhanKapasitas,
        hari: modal?.hari,
        jamMulai: shiftTerpilih?.jam_mulai,
        jamSelesai: shiftTerpilih?.jam_selesai,
        excludeJadwalId: modal?.jadwal?.id,
      }),
    [ruangList, kelasSemester, kebutuhanKapasitas, modal, shiftTerpilih],
  );
  const statusRuang = (ruangId) =>
    analisis.find((item) => item.ruang.id === ruangId) || null;

  const penandaRuang = (ruangId) => {
    const status = statusRuang(ruangId);
    const tanda = [];
    if (status && !status.cukupKapasitas) tanda.push("⚠ kapasitas kurang");
    else if (status?.belumDipakai) tanda.push("✓ kosong semester ini");
    if (status?.bentrokSlot) tanda.push("⚠ terpakai di jam ini");
    return tanda.join(" · ");
  };
  const ruangOptions = ruangList.map((row) => {
    const tanda = penandaRuang(row.id);
    return {
      value: row.id,
      label: tanda ? `${ruangLabel(row)} · ${tanda}` : ruangLabel(row),
    };
  });

  // Ruang pengganti yang aman: tidak bentrok di slot ini dan kapasitasnya cukup.
  // Ruang yang belum dipakai se-semester didahulukan, lalu kapasitas terkecil.
  const ruangDisarankan = analisis
    .filter((item) => item.disarankan)
    .sort((a, b) => {
      if (a.belumDipakai !== b.belumDipakai) return a.belumDipakai ? -1 : 1;
      return Number(a.ruang.kapasitas || 0) - Number(b.ruang.kapasitas || 0);
    });
  const kuotaKosong = analisis.filter((item) => item.belumDipakai).length;

  const ruangTerpilih =
    ruangList.find((row) => row.id === values.ruang_id) || null;
  const ruangKurangKapasitas = Boolean(
    ruangTerpilih && ruangTerlaluKecil(ruangTerpilih),
  );

  const bentrok = (() => {
    if (!modal || !shiftTerpilih) return [];
    const kandidat = {
      hari: modal.hari,
      jam_mulai: shiftTerpilih.jam_mulai,
      jam_selesai: shiftTerpilih.jam_selesai,
    };
    const dosenKelas = new Set(
      (modal.kelas?.dosenKelas || []).map((row) => row.dosen_id),
    );
    const hasil = [];
    for (const kelas of kelasList) {
      for (const jadwal of kelas.jadwalKelas || []) {
        if (jadwal.id === modal.jadwal?.id) continue;
        if (jadwal.hari !== modal.hari || !jamOverlap(jadwal, kandidat))
          continue;
        const alasan = new Set();
        if (values.ruang_id && jadwal.ruang_id === values.ruang_id)
          alasan.add("ruang");
        if (
          (kelas.dosenKelas || []).some((row) => dosenKelas.has(row.dosen_id))
        )
          alasan.add("dosen");
        if (kelas.semester_prodi_id === modal.kelas.semester_prodi_id)
          alasan.add("kelas");
        if (alasan.size) hasil.push({ kelas, jadwal, alasan: [...alasan] });
      }
    }
    return hasil;
  })();

  const loading =
    org.isLoading || Boolean(semesterProdiKey && kelasQuery.isPending);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Jadwal & Ruang"
        subtitle="Susun jadwal kelas sekaligus ruangannya per program studi. Sistem menolak bentrok ruang, dosen, dan mahasiswa semester yang sama."
        breadcrumbs={[{ label: "Perkuliahan" }, { label: "Jadwal & Ruang" }]}
        action={
          konflik.size ? (
            <Badge variant="error" size="sm">
              {konflik.size} jadwal bermasalah
            </Badge>
          ) : null
        }
      />

      <Card title="Filter">
        <div className="grid gap-3 md:grid-cols-2">
          <Select
            label="Program Studi"
            placeholder="Pilih program studi"
            options={prodiList.map((row) => ({
              value: row.id,
              label: row.nama_resmi || row.nama_singkat || row.kode_prodi,
            }))}
            value={activeProdiId}
            disabled={org.scoped && Boolean(org.prodiId)}
            onChange={(event) => {
              const value = event.target.value;
              setProdiId(value);
              setSemesterProdiId("");
              if (!org.scoped) {
                org.setContext({
                  fakultasId: org.fakultasId,
                  departemenId: org.departemenId,
                  prodiId: value,
                });
              }
            }}
          />
          <Select
            label="Semester"
            placeholder="Pilih semester"
            options={semesterProdiList.map((row) => ({
              value: row.id,
              label: `${semesterAkademikLabel(row.semester)}${row.is_aktif ? " · aktif" : ""}`,
            }))}
            value={semesterProdiKey}
            onChange={(event) => setSemesterProdiId(event.target.value)}
            disabled={!semesterProdiList.length}
          />
        </div>
        <p className="mt-2 text-xs text-base-content/60">
          Program studi mengikuti pilihan unit pada filter global di header.
          Ruang dipakai bersama seluruh program studi.
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-base-content/60">
          {Object.entries(KONFLIK_LABEL).map(([jenis, label]) => (
            <span key={jenis} className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-error" />{" "}
              {label}
            </span>
          ))}
        </div>
      </Card>

      <Card
        title={
          activeSemesterProdi
            ? `Grid Jadwal — ${activeSemesterProdi.programStudi?.nama_resmi}`
            : "Grid Jadwal"
        }
        actions={
          kelasList.length ? (
            <span className="text-xs text-base-content/60">
              {kelasList.length} kelas
            </span>
          ) : null
        }
      >
        {loading ? (
          <PageSkeleton cards={1} />
        ) : !semesterProdiKey ? (
          <p className="text-sm text-base-content/60">
            Pilih program studi terlebih dahulu.
          </p>
        ) : (
          <JadwalGrid
            kelasList={kelasList}
            konflik={konflik}
            canCreate={canCreate}
            canUpdate={canUpdate}
            onAdd={openAdd}
            onEdit={openEdit}
          />
        )}
        {semesterProdiKey && !shiftList.length && (
          <p className="mt-3 text-xs text-base-content/60">
            Belum ada shift untuk fakultas ini. Atur dulu di menu{" "}
            <span className="font-medium">Shift Jadwal</span>.
          </p>
        )}
      </Card>

      <Modal
        open={Boolean(modal)}
        onClose={() => setModal(null)}
        title={modal?.jadwal ? "Ubah Jadwal" : "Tambah Jadwal"}
        subtitle={
          modal ? `${kelasDisplayName(modal.kelas)} · ${modal.hari}` : ""
        }
        closeOnBackdrop={
          !jadwalMutations.create.isPending && !jadwalMutations.update.isPending
        }
        footer={
          <FormActions
            onCancel={() => setModal(null)}
            submitLabel="Simpan"
            isLoading={
              jadwalMutations.create.isPending ||
              jadwalMutations.update.isPending
            }
            onSubmitClick={() =>
              document.getElementById("jadwal-form")?.requestSubmit()
            }
          />
        }
      >
        <form id="jadwal-form" onSubmit={submit} className="space-y-3">
          <div className="rounded-box bg-base-200 px-3 py-2 text-sm">
            <span className="text-base-content/60">Hari</span>
            <span className="ml-2 font-medium">{modal?.hari}</span>
            <span className="mx-2 text-base-content/30">|</span>
            <span className="text-base-content/60">Kebutuhan ruang</span>
            <span className="ml-2 font-medium">
              {kebutuhanKapasitas
                ? `kapasitas ≥ ${kebutuhanKapasitas}`
                : "belum diatur"}
            </span>
          </div>
          <Select
            label="Shift *"
            placeholder="Pilih shift"
            options={shiftOptions}
            value={values.shift_id}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, shift_id: event.target.value }))
            }
            required
          />
          <Select
            label="Ruang"
            placeholder="Pilih ruang"
            options={ruangOptions}
            value={values.ruang_id}
            onChange={(event) =>
              setValues((prev) => ({ ...prev, ruang_id: event.target.value }))
            }
          />
          {shiftTerpilih && (
            <p className="text-xs text-base-content/60">
              Jam mengikuti shift: {formatJam(shiftTerpilih.jam_mulai)}–
              {formatJam(shiftTerpilih.jam_selesai)}.
            </p>
          )}

          {ruangKurangKapasitas && (
            <div className="rounded-box border border-error/40 bg-error/10 px-3 py-2 text-xs text-error">
              Kapasitas {ruangTerpilih.kode || ruangTerpilih.nama} hanya{" "}
              {ruangTerpilih.kapasitas}, sedangkan kelas ini butuh{" "}
              {kebutuhanKapasitas}. Pilih ruang yang lebih besar.
            </div>
          )}

          {shiftTerpilih && (
            <div className="rounded-box border border-base-300 px-3 py-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-medium text-base-content/80">
                  Ruang pengganti yang cukup & kosong
                </p>
                <span className="text-xs text-base-content/50">
                  {kuotaKosong}/{ruangList.length} ruang belum dipakai semester
                  ini
                </span>
              </div>
              {ruangDisarankan.length ? (
                <>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {ruangDisarankan.slice(0, 8).map((item) => (
                      <button
                        key={item.ruang.id}
                        type="button"
                        title={
                          item.belumDipakai
                            ? "Belum dipakai di semester ini"
                            : "Sudah dipakai semester ini, tapi kosong pada jam ini"
                        }
                        onClick={() =>
                          setValues((prev) => ({
                            ...prev,
                            ruang_id: item.ruang.id,
                          }))
                        }
                        className={`btn btn-xs font-normal ${
                          item.ruang.id === values.ruang_id
                            ? "btn-primary"
                            : "btn-ghost border border-base-300"
                        }`}
                      >
                        {item.ruang.kode || item.ruang.nama}
                        {Number(item.ruang.kapasitas || 0) > 0
                          ? ` · ${item.ruang.kapasitas}`
                          : ""}
                        {item.belumDipakai ? " ✓" : ""}
                      </button>
                    ))}
                    {ruangDisarankan.length > 8 && (
                      <span className="self-center text-xs text-base-content/50">
                        +{ruangDisarankan.length - 8} lainnya
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-base-content/50">
                    ✓ = belum dipakai di semester ini
                  </p>
                </>
              ) : (
                <p className="mt-1 text-xs text-base-content/60">
                  Tidak ada ruang yang bebas pada jam ini. Pilih shift lain atau
                  periksa kapasitas kelas.
                </p>
              )}
            </div>
          )}

          {bentrok.length > 0 && (
            <div className="rounded-box border border-error/40 bg-error/10 px-3 py-2 text-xs text-error">
              <p className="font-medium">Berpotensi bentrok:</p>
              <ul className="mt-1 list-disc space-y-0.5 pl-4">
                {bentrok.slice(0, 5).map((item) => (
                  <li key={item.jadwal.id}>
                    {kelasDisplayName(item.kelas)} (
                    {item.alasan
                      .map((jenis) => KONFLIK_LABEL[jenis])
                      .join(", ")}
                    )
                  </li>
                ))}
              </ul>
            </div>
          )}

          {modal?.jadwal && canDelete && (
            <Button
              type="button"
              size="xs"
              variant="ghost"
              className="gap-1 text-error"
              onClick={() => {
                setDeleteTarget(modal.jadwal);
                setModal(null);
              }}
            >
              <Trash2 size={13} /> Hapus jadwal ini
            </Button>
          )}
        </form>
      </Modal>

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Jadwal"
        message="Yakin ingin menghapus jadwal ini? Kelas akan kehilangan sesi pada hari tersebut."
        onConfirm={konfirmasiHapus}
        isLoading={jadwalMutations.remove.isPending}
      />
    </div>
  );
};
