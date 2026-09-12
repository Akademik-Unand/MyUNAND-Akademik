import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AlertTriangle, CalendarClock, Info, ListTree } from "lucide-react";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Select } from "../../components/ui/Select";
import { Badge } from "../../components/ui/Badge";
import { Modal } from "../../components/ui/Modal";
import { DataTable } from "../../components/common/DataTable";
import { ConfirmDeleteModal } from "../../components/common/ConfirmDeleteModal";
import { PageSkeleton } from "../../components/common/PageSkeleton";
import { useAuthStore } from "../../store/auth.store";
import { useResourceQuery } from "../../hooks/useResourceQuery";
import { createResourceItem, deleteResourceItem } from "../../services/api";
import { getStudentKrsContext } from "../../services/krs.service";
import { submitCrossEnrollment } from "../../services/crossEnrollment.service";
import { CpmkOutline } from "../../components/cpmk/CpmkOutline";
import { semesterAkademikLabel } from "../../helpers/academicLabel";
import {
  isKrsPeriodOpen,
  krsPeriodNotice,
  krsPeriodStatus,
} from "../../helpers/krsPeriod";
import { kelasDosenNames } from "../../helpers/kelasInfo";
import { deteksiBentrokKelasKrs, labelBentrokKrs } from "../../helpers/jadwal";
import {
  approvalStatusLabel,
  registeredKrsRows,
} from "../../utils/crossEnrollment";

const STATUS_VARIANT = {
  pending_pa: "warning",
  approved: "success",
  rejected: "error",
};

const NOTICE_ICON = {
  info: Info,
  warning: AlertTriangle,
  error: CalendarClock,
};

const NOTICE_CLASS = {
  info: "border-info/30 bg-info/5 text-info",
  warning: "border-warning/40 bg-warning/10 text-base-content",
  error: "border-error/40 bg-error/10 text-error",
};

/** Pemberitahuan status jendela KRS di atas daftar mata kuliah. */
const PeriodNotice = ({ notice }) => {
  const Icon = NOTICE_ICON[notice.variant];
  return (
    <div
      className={`flex items-start gap-2 rounded-box border px-3 py-2 text-sm ${NOTICE_CLASS[notice.variant]}`}
    >
      <Icon size={16} className="mt-0.5 shrink-0" />
      <div>
        <p className="font-medium">{notice.title}</p>
        <p className="text-xs text-base-content/70">{notice.message}</p>
      </div>
    </div>
  );
};

/** Status baris KRS — reguler dan lintas prodi memakai kosakata status yang sama. */
const statusBadge = (row) => (
  <Badge variant={STATUS_VARIANT[row.status] || "ghost"} size="xs">
    {approvalStatusLabel(row.status)}
  </Badge>
);

/**
 * KRS ini mensyaratkan mengikuti disiplin pada backend:
 * - detail.matakuliah.has_prasyarat => tidak boleh lintas prodi
 * - akses 'terpilih' => prodi mahasiswa harus ada di prodiTujuan
 * - minimal/maksimal_semester => dihitung dari angkatan vs tahun penawaran
 */
const canTakeCross = (detail, header, { prodiId, angkatan, tahun }) => {
  if (detail.matakuliah?.has_prasyarat) return false;
  if (
    header.akses === "terpilih" &&
    !(header.prodiTujuan || []).some((p) => p.program_studi_id === prodiId)
  ) {
    return false;
  }
  const semesterKe = angkatan ? Math.max(1, (tahun - angkatan) * 2 + 1) : null;
  if (semesterKe == null) return true;
  const min = detail.minimal_semester ?? header.minimal_semester_default;
  const max = detail.maksimal_semester ?? header.maksimal_semester_default;
  if ((min && semesterKe < min) || (max && semesterKe > max)) return false;
  return true;
};

export const PengambilanKrsPage = () => {
  const client = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const contextQuery = useQuery({
    queryKey: ["krs", "student-context", user?.id],
    queryFn: getStudentKrsContext,
    enabled: Boolean(user?.id),
  });
  const mahasiswa = contextQuery.data?.mahasiswa;
  const mahasiswaId = mahasiswa?.id || user?.mahasiswa_id;
  const prodiId =
    mahasiswa?.program_studi_id || user?.mahasiswa?.program_studi_id;
  const angkatan = mahasiswa?.angkatan;
  const semester = contextQuery.data?.semester;
  const semesterId = semester?.id;
  // Jendela pengambilan KRS semester berjalan (periode global). Mahasiswa perlu
  // tahu kondisinya sebelum sempat menekan Ambil dan kena 422 dari server.
  const periode = contextQuery.data?.periode;
  // Tanpa semester aktif, akar masalahnya bukan jendela periode — sebut apa
  // adanya supaya mahasiswa tidak menunggu tanggal yang belum tentu berlaku.
  const periodStatus = semester
    ? krsPeriodStatus(periode)
    : { label: "Belum ada semester", variant: "ghost" };
  const periodNotice = semester
    ? krsPeriodNotice(periode)
    : {
        variant: "warning",
        title: "Belum ada semester aktif",
        message:
          "Hubungi admin akademik untuk mengaktifkan semester berjalan sebelum mengambil KRS.",
      };
  const periodOpen = isKrsPeriodOpen(periode);

  // Satu kali ambil semua penawaran published di semester aktif (prodi sendiri + lintas),
  // lalu filter prodi dilakukan di klien.
  const catalogQuery = useResourceQuery("katalog-lintas-prodi", {
    params: semesterId ? { filter: { semester_id: semesterId } } : undefined,
    enabled: Boolean(semesterId),
  });
  const offerings = catalogQuery.data || [];

  // Daftar prodi pada filter: prodi sendiri di urutan pertama, lalu prodi
  // penyelenggara penawaran (selain prodi sendiri) yang muncul di semester ini.
  const ownProdi = mahasiswa?.programStudi;
  const hostProdiMap = new Map();
  offerings.forEach((row) => {
    const ps = row.programStudi;
    if (ps?.id && ps.id !== prodiId) hostProdiMap.set(ps.id, ps);
  });
  const prodiOptions = [
    { value: prodiId, label: ownProdi?.nama_resmi || "Prodi Anda" },
    ...[...hostProdiMap.values()].map((ps) => ({
      value: ps.id,
      label: ps.nama_resmi,
    })),
  ].filter((opt) => opt.value);
  const hasCrossProdi = prodiOptions.some((opt) => opt.value !== prodiId);

  const [selectedProdi, setSelectedProdi] = useState(null);
  const activeProdiId = prodiOptions.some((opt) => opt.value === selectedProdi)
    ? selectedProdi
    : prodiId;

  const offering = offerings.find(
    (row) =>
      row.program_studi_id === activeProdiId && row.semester_id === semesterId,
  );
  const isOwnOffer = activeProdiId === prodiId;
  const tahun = offering?.semester?.tahun || new Date().getFullYear();

  // KRS header yang baru dibuat sesi ini (sebelum refetch query selesai),
  // supaya penambahan berikutnya tidak membuat header KRS ganda.
  const [createdKrs, setCreatedKrs] = useState(null);
  // Data server selalu menang begitu refetch mendarat: header hasil `POST /krs`
  // dikembalikan tanpa baris detil, jadi kalau header lokal terus dipakai,
  // daftar "Mata Kuliah di KRS Anda" (dan badge "Diambil") tidak pernah terisi
  // sampai halaman dimuat ulang. `createdKrs` hanya jaring pengaman sebelum
  // refetch pertama selesai — dan id-nya sama dengan yang dikembalikan server.
  const krs = contextQuery.data?.krs || createdKrs;
  // Detil yang baru ditambahkan menyusul lewat refetch, jadi beri tanda halus
  // bahwa daftarnya sedang menyegarkan diri.
  const krsRefreshing = contextQuery.isFetching;

  const [selections, setSelections] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [cpmkTarget, setCpmkTarget] = useState(null);

  const invalidateKrs = () => {
    client.invalidateQueries({
      queryKey: ["krs", "student-context", user?.id],
    });
  };

  const addItem = useMutation({
    mutationFn: async ({ kelasId }) => {
      let target = krs;
      if (!target) {
        target = await createResourceItem("krs", {
          mahasiswa_id: mahasiswaId,
          semester_id: semester.id,
        });
        setCreatedKrs(target);
      }
      return createResourceItem("krs-detil", {
        krs_id: target.id,
        kelas_id: kelasId,
      });
    },
    onSuccess: () => {
      invalidateKrs();
      toast.success("Mata kuliah ditambahkan ke KRS.");
    },
    onError: (error) => toast.error(error.message),
  });

  const crossSubmit = useMutation({
    mutationFn: async ({ penawaranId, kelasId }) => {
      let target = krs;
      if (!target) {
        target = await createResourceItem("krs", {
          mahasiswa_id: mahasiswaId,
          semester_id: semester.id,
        });
        setCreatedKrs(target);
      }
      return submitCrossEnrollment({ penawaranId, kelasId });
    },
    onSuccess: () => {
      invalidateKrs();
      toast.success("Pengajuan lintas program studi dikirim ke dosen PA.");
    },
    onError: (error) => toast.error(error.message),
  });

  // Satu jalur untuk semua baris KRS: selama KRS belum disetujui, baris reguler
  // maupun pengajuan lintas prodi sama-sama dihapus dari krs_detil.
  const removeItem = useMutation({
    mutationFn: (row) => deleteResourceItem("krs-detil", row.id),
    onSuccess: () => {
      invalidateKrs();
      toast.success("Mata kuliah dihapus dari KRS.");
    },
    onError: (error) => toast.error(error.message),
  });

  if (!mahasiswaId) {
    return (
      <Card title="Pengambilan KRS">
        <p className="text-sm text-base-content/60">
          Halaman ini khusus untuk akun mahasiswa. Hubungi admin jika akun Anda
          belum terhubung ke data mahasiswa.
        </p>
      </Card>
    );
  }

  // Seluruh baris KRS ditampilkan (termasuk pengajuan lintas yang ditolak), tetapi
  // hanya baris aktif yang mengikat — pengajuan non-aktif tidak menahan kapasitas
  // sehingga kelasnya bisa diambil ulang.
  const registeredRows = registeredKrsRows(krs?.krsDetil);
  const registeredAktif = registeredRows.filter((row) => row.aktif);
  const registeredKelasIds = new Set(
    registeredAktif.map((row) => row.kelas_id),
  );

  const details = (offering?.matakuliahDitawarkan || []).filter((detail) =>
    isOwnOffer
      ? true
      : canTakeCross(detail, offering, { prodiId, angkatan, tahun }),
  );

  // Bentrok jadwal tiap kelas kandidat terhadap MK yang sudah di KRS — dipakai
  // untuk menyebut MK mana yang bentrok sebelum mahasiswa menekan Ambil/Ajukan.
  const bentrokPerKelas = deteksiBentrokKelasKrs(
    details.flatMap((detail) => detail.kelas || []),
    registeredAktif,
  );

  const pickRows = details.map((detail) => {
    const kelas = detail.kelas || [];
    const taken = kelas.find((k) => registeredKelasIds.has(k.id)) || null;
    return {
      id: detail.id,
      lintas: !isOwnOffer,
      nama: detail.matakuliah?.nama_resmi || "—",
      kode: detail.matakuliah?.kode_matakuliah || "—",
      sks: detail.matakuliah?.jumlah_sks_kurikulum ?? "—",
      cpmk: detail.matakuliah?.cpmk || [],
      kelas,
      taken,
      options: kelas.map((k) => ({
        value: k.id,
        label: `Kelas ${k.nama}${k.dosenKelas?.length ? ` — ${kelasDosenNames(k)}` : ""}${
          bentrokPerKelas.has(k.id)
            ? ` ⚠ bentrok ${bentrokPerKelas.get(k.id)[0].kode}`
            : ""
        }`,
      })),
    };
  });

  const loading = contextQuery.isPending || catalogQuery.isPending;
  const submitPending = addItem.isPending || crossSubmit.isPending;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Pengambilan KRS"
        subtitle="Ambil mata kuliah dari prodi Anda maupun lintas program studi — hanya penawaran yang dibuka (published) dan memenuhi syarat yang tersedia"
        breadcrumbs={[{ label: "KRS Mahasiswa" }, { label: "Pengambilan KRS" }]}
        action={
          <Badge variant={periodStatus.variant} size="sm">
            KRS: {periodStatus.label}
          </Badge>
        }
      />

      {loading ? (
        <PageSkeleton cards={2} />
      ) : (
        <>
          {periodNotice && <PeriodNotice notice={periodNotice} />}

          <Card
            title={`Pilih Mata Kuliah${semester ? ` — ${semesterAkademikLabel(semester)}` : ""}`}
            actions={
              krs?.approval_ke > 0 ? (
                <Badge variant="success" size="sm">
                  KRS sudah disetujui, tidak dapat diubah
                </Badge>
              ) : null
            }
          >
            {!offering ? (
              <p className="text-sm text-base-content/60">
                {semester
                  ? "Belum ada penawaran mata kuliah yang dibuka untuk semester ini."
                  : "Belum ada semester aktif. Hubungi admin untuk mengaktifkan semester."}
              </p>
            ) : (
              <>
                <div className="mb-4 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm text-base-content/70">
                      Program studi:
                    </span>
                    <Select
                      size="sm"
                      className="min-w-56"
                      options={prodiOptions}
                      value={activeProdiId || ""}
                      onChange={(e) => setSelectedProdi(e.target.value)}
                    />
                    {!isOwnOffer && (
                      <Badge variant="info" size="xs">
                        Lintas Prodi
                      </Badge>
                    )}
                  </div>
                  {hasCrossProdi ? (
                    <div className="flex items-start gap-2 rounded-lg border border-base-300 bg-base-200 px-3 py-2">
                      <Info size={16} className="mt-0.5 shrink-0 text-info" />
                      <p className="text-xs text-base-content/70">
                        Anda juga bisa mengambil mata kuliah dari program studi
                        lain. Pilih program studi lain pada daftar di atas untuk
                        melihatnya — pengambilan lintas prodi menunggu
                        persetujuan dosen PA.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-base-content/60">
                      Belum ada mata kuliah dari program studi lain yang dibuka
                      untuk semester ini.
                    </p>
                  )}
                </div>

                <DataTable
                  data={pickRows}
                  tableKey="krs_pick_"
                  rowKey={(row) => row.id}
                  searchableFields={["nama", "kode"]}
                  searchPlaceholder="Cari mata kuliah..."
                  emptyText={
                    isOwnOffer
                      ? "Belum ada mata kuliah yang dibuka."
                      : "Tidak ada mata kuliah lintas prodi yang dapat diambil dari program studi ini."
                  }
                  columns={[
                    {
                      key: "nama",
                      header: "Mata Kuliah",
                      render: (row) => (
                        <div>
                          <div className="font-medium">{row.nama}</div>
                          <div className="text-xs text-base-content/60">
                            {row.kode}
                            {row.lintas ? " · Lintas Prodi" : ""}
                          </div>
                          <button
                            type="button"
                            className="btn btn-ghost btn-xs mt-0.5 gap-1 px-1 font-medium text-primary"
                            onClick={() => setCpmkTarget(row)}
                          >
                            <ListTree size={12} /> CPMK
                            {row.cpmk.length ? ` (${row.cpmk.length})` : ""}
                          </button>
                        </div>
                      ),
                    },
                    { key: "sks", header: "SKS" },
                    {
                      key: "kelas",
                      header: "Kelas",
                      render: (row) => {
                        if (row.taken) {
                          return (
                            <Badge variant="success" size="xs">
                              Kelas {row.taken.nama}
                            </Badge>
                          );
                        }
                        if (row.kelas.length === 0) {
                          return (
                            <span className="text-xs text-base-content/50">
                              Belum ada kelas
                            </span>
                          );
                        }
                        const bentrok = bentrokPerKelas.get(
                          Number(selections[row.id]),
                        );
                        return (
                          <div className="space-y-1">
                            <Select
                              size="sm"
                              placeholder="Pilih kelas"
                              options={row.options}
                              value={selections[row.id] || ""}
                              onChange={(e) =>
                                setSelections((prev) => ({
                                  ...prev,
                                  [row.id]: e.target.value,
                                }))
                              }
                            />
                            {bentrok?.length ? (
                              <p className="text-xs text-error">
                                Bentrok dengan {labelBentrokKrs(bentrok)}
                              </p>
                            ) : null}
                          </div>
                        );
                      },
                    },
                    {
                      header: "Aksi",
                      className: "text-right",
                      cellClassName: "text-right",
                      render: (row) =>
                        row.taken ? (
                          <span className="text-xs text-base-content/50">
                            Diambil
                          </span>
                        ) : (
                          <Button
                            size="xs"
                            disabled={
                              !selections[row.id] ||
                              krs?.approval_ke > 0 ||
                              submitPending ||
                              !periodOpen
                            }
                            isLoading={submitPending}
                            onClick={() =>
                              row.lintas
                                ? crossSubmit.mutate({
                                    penawaranId: row.id,
                                    kelasId: selections[row.id],
                                  })
                                : addItem.mutate({
                                    kelasId: selections[row.id],
                                  })
                            }
                          >
                            {row.lintas ? "Ajukan" : "Ambil"}
                          </Button>
                        ),
                    },
                  ]}
                />
              </>
            )}
          </Card>

          <Card
            title="Mata Kuliah di KRS Anda"
            actions={
              krsRefreshing ? (
                <span className="text-xs text-base-content/50">
                  Menyegarkan…
                </span>
              ) : null
            }
          >
            {registeredRows.length === 0 ? (
              <p className="text-sm text-base-content/60">
                Belum ada mata kuliah di KRS Anda.
              </p>
            ) : (
              <DataTable
                data={registeredRows}
                tableKey="krs_taken_"
                rowKey={(row) => row.id}
                searchableFields={["nama", "kode"]}
                searchPlaceholder="Cari mata kuliah..."
                columns={[
                  {
                    key: "nama",
                    header: "Mata Kuliah",
                    render: (row) => (
                      <div>
                        <div className="font-medium">{row.nama}</div>
                        <div className="flex items-center gap-1.5 text-xs text-base-content/60">
                          <span>{row.kode}</span>
                          {row.lintas && (
                            <Badge variant="info" size="xs">
                              Lintas Prodi
                            </Badge>
                          )}
                        </div>
                        {row.status === "rejected" && row.rejection_reason && (
                          <div className="text-xs text-error">
                            Ditolak: {row.rejection_reason}
                          </div>
                        )}
                      </div>
                    ),
                  },
                  {
                    key: "kelas",
                    header: "Kelas",
                    render: (row) => row.kelas?.nama || "—",
                  },
                  { key: "approved", header: "Status", render: statusBadge },
                  {
                    header: "Aksi",
                    className: "text-right",
                    cellClassName: "text-right",
                    render: (row) => (
                      <div className="flex justify-end">
                        <Button
                          size="xs"
                          variant="ghost"
                          disabled={krs?.approval_ke > 0}
                          onClick={() => setDeleteTarget(row)}
                        >
                          Hapus
                        </Button>
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </>
      )}

      <ConfirmDeleteModal
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Hapus Mata Kuliah dari KRS"
        message={
          deleteTarget
            ? `Yakin ingin menghapus ${deleteTarget.nama} dari KRS Anda?`
            : ""
        }
        onConfirm={async () => {
          await removeItem.mutateAsync(deleteTarget);
          setDeleteTarget(null);
        }}
        isLoading={removeItem.isPending}
      />

      <Modal
        open={Boolean(cpmkTarget)}
        onClose={() => setCpmkTarget(null)}
        title="CPMK & Sub-CPMK"
        subtitle={cpmkTarget ? `${cpmkTarget.kode} — ${cpmkTarget.nama}` : ""}
        size="lg"
      >
        <CpmkOutline cpmk={cpmkTarget?.cpmk || []} />
      </Modal>
    </div>
  );
};
