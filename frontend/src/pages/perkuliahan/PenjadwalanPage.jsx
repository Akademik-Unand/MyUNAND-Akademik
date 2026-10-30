import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, Play, Square } from "lucide-react";
import { Can } from "../../components/auth/Can";
import { PageHeader } from "../../components/common/PageHeader";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { DataTable } from "../../components/common/DataTable";
import { useResourceQuery } from "../../hooks/useResourceQuery";
import {
  useSchedulingSetup,
  useSchedulingScenario,
  useSchedulingMutation,
  useSchedulingJobs,
  useSchedulingHistory,
} from "../../hooks/usePenjadwalan";
import {
  schedulingCreate,
  schedulingPolicy,
  schedulingAction,
  schedulingEdit,
} from "../../services/penjadwalan.service";
import { PolicyForm } from "../../components/penjadwalan/PolicyForm";
import { SessionForm } from "../../components/penjadwalan/SessionForm";
import { ResultsPanel } from "../../components/penjadwalan/ResultsPanel";
import { ImportPanel } from "../../components/penjadwalan/ImportPanel";
import { SchedulingSkeleton } from "../../components/penjadwalan/SchedulingSkeleton";

const statuses = {
  draft: "Draf",
  queued: "Dalam antrean",
  running: "Sedang disusun",
  solved: "Solusi tersedia",
  infeasible: "Tidak memungkinkan",
  unknown: "Belum ada kesimpulan",
  failed: "Proses gagal",
  published: "Dipublikasikan",
};

const statusBadgeVariant = (status) => {
  if (status === "published") return "success";
  if (status === "solved") return "info";
  if (status === "running" || status === "queued") return "warning";
  if (status === "failed" || status === "infeasible") return "error";
  return "ghost";
};

export function PenjadwalanPage() {
  const { id } = useParams();
  return id ? <ScenarioDetail key={id} id={id} /> : <SchedulingHome />;
}

function SchedulingHome() {
  const [search, setSearch] = useSearchParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState("list");
  const semester = search.get("semester") || "",
    faculty = search.get("faculty") || "";
  const semesters = useResourceQuery("setting-semester"),
    faculties = useResourceQuery("fakultas"),
    semesterTypes = useResourceQuery("jenis-semester");
  const setup = useSchedulingSetup(semester, faculty);
  const create = useSchedulingMutation((body) =>
    schedulingCreate({ semester_id: semester, fakultas_id: faculty, ...body }),
  );
  const policy = useSchedulingMutation((config) =>
    schedulingPolicy({ semester_id: semester, fakultas_id: faculty, config }),
  );
  const select = (key, value) =>
    setSearch((prev) => {
      const next = new URLSearchParams(prev);
      next.set(key, value);
      return next;
    });

  const tabTitle =
    tab === "list"
      ? "Daftar Skenario"
      : tab === "new"
        ? "Buat Skenario Penjadwalan"
        : "Kebijakan Gedung & Sumber Daya";
  const tabSubtitle =
    tab === "list"
      ? "Buka skenario untuk melihat jadwal, menjalankan simulasi, dan meninjau perubahan."
      : tab === "new"
        ? "Tentukan kebutuhan kelas terlebih dahulu. Jadwal aktif baru berubah setelah pengesahan dan publikasi."
        : "Atur gedung yang boleh digunakan, lengkapi ruang, lalu tetapkan aturan waktu sebelum membuat skenario.";

  return (
    <div className="space-y-4">
      <PageHeader
        title="Penjadwalan Global"
        subtitle="Pertahankan jadwal acuan, utamakan gedung fakultas, lalu tinjau sebelum publikasi."
        breadcrumbs={[
          { label: "Perkuliahan" },
          { label: "Penjadwalan Global" },
        ]}
      />

      <Card>
        <div className="grid md:grid-cols-2 gap-4">
          <label className="fieldset">
            <span className="fieldset-legend text-xs font-semibold">
              Semester
            </span>
            <select
              className="select select-sm w-full"
              value={semester}
              onChange={(e) => select("semester", e.target.value)}
            >
              <option value="">Pilih semester</option>
              {(semesters.data || []).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.tahun} ·{" "}
                  {s.jenisSemester?.nama ||
                    semesterTypes.data?.find((j) => j.id === s.jenis_semester_id)
                      ?.nama ||
                    "Semester"}
                </option>
              ))}
            </select>
          </label>
          <label className="fieldset">
            <span className="fieldset-legend text-xs font-semibold">
              Fakultas
            </span>
            <select
              className="select select-sm w-full"
              value={faculty}
              onChange={(e) => select("faculty", e.target.value)}
            >
              <option value="">Pilih fakultas</option>
              {(faculties.data || []).map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nama_resmi || f.nama_fakultas}
                </option>
              ))}
            </select>
          </label>
        </div>
        {(semesters.error || faculties.error) && (
          <p role="alert" className="text-error text-sm mt-2">
            {semesters.error?.message || faculties.error?.message}
          </p>
        )}
      </Card>

      <div
        className="tabs tabs-box w-fit bg-base-200 flex-wrap gap-1"
        aria-label="Bagian penjadwalan"
      >
        <button
          type="button"
          className={`tab ${tab === "list" ? "tab-active" : ""}`}
          onClick={() => setTab("list")}
        >
          Skenario
        </button>
        <Can I="create" a="Penjadwalan">
          <button
            type="button"
            className={`tab ${tab === "new" ? "tab-active" : ""}`}
            onClick={() => setTab("new")}
          >
            Buat Skenario
          </button>
        </Can>
        <Can I="configure" a="Penjadwalan">
          <button
            type="button"
            className={`tab ${tab === "policy" ? "tab-active" : ""}`}
            onClick={() => setTab("policy")}
          >
            Kebijakan Gedung &amp; Sumber Daya
          </button>
        </Can>
      </div>

      <Card title={tabTitle} subtitle={tabSubtitle}>
        {tab === "list" ? (
          <DataTable
            resource="penjadwalan-scenarios"
            tableKey="scenario_"
            extraFilter={{
              ...(semester ? { semester_id: semester } : {}),
              ...(faculty ? { fakultas_id: faculty } : {}),
            }}
            rowKey={(r) => r.id}
            searchPlaceholder="Cari nama skenario..."
            columns={[
              { key: "nama", header: "Skenario", sortable: true },
              { key: "revision", header: "Versi", sortable: true },
              {
                key: "status",
                header: "Status",
                sortable: true,
                render: (r) => (
                  <Badge variant={statusBadgeVariant(r.status)} size="sm" soft>
                    {statuses[r.status] || r.status}
                  </Badge>
                ),
              },
              {
                key: "createdAt",
                header: "Dibuat",
                sortable: true,
                render: (r) => new Date(r.createdAt).toLocaleString("id-ID"),
              },
              {
                key: "actions",
                header: "Aksi",
                render: (r) => (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/perkuliahan/penjadwalan/${r.id}`)}
                  >
                    Buka skenario
                  </Button>
                ),
              },
            ]}
            emptyText="Belum ada skenario penjadwalan."
          />
        ) : !semester || !faculty ? (
          <div className="alert">
            Pilih semester dan fakultas terlebih dahulu pada filter di atas.
          </div>
        ) : setup.isPending ? (
          <SchedulingSkeleton />
        ) : setup.error ? (
          <div role="alert" className="alert alert-error">
            {setup.error.message}
          </div>
        ) : tab === "policy" ? (
          <PolicyForm
            key={`${semester}-${faculty}-${setup.data.policy?.updatedAt || ""}`}
            setup={setup.data}
            facultyName={
              faculties.data?.find((f) => f.id === faculty)?.nama_resmi ||
              faculties.data?.find((f) => f.id === faculty)?.nama_fakultas
            }
            faculties={faculties.data || []}
            busy={policy.isPending}
            onSave={(config) => policy.mutate(config)}
          />
        ) : !setup.data.policy ? (
          <div className="alert alert-warning">
            Pusat perlu menetapkan kebijakan gedung fakultas sebelum skenario
            dibuat.
          </div>
        ) : !setup.data.classes.length ? (
          <div className="alert">
            Belum ada kelas fakultas pada semester ini.
          </div>
        ) : (
          <SessionForm
            key={`${semester}-${faculty}`}
            setup={setup.data}
            busy={create.isPending}
            onSave={async (body) => {
              const item = await create.mutateAsync(body).catch(() => null);
              if (item) navigate(`/perkuliahan/penjadwalan/${item.id}`);
            }}
          />
        )}
      </Card>
    </div>
  );
}

function ScenarioDetail({ id }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("result");
  const [copyName, setCopyName] = useState("");
  const query = useSchedulingScenario(id);
  const scenario = query.data;
  const setup = useSchedulingSetup(
    scenario?.semester_id,
    scenario?.fakultas_id,
  );
  const active = ["queued", "running"].includes(scenario?.status);
  const jobs = useSchedulingJobs(id, active),
    history = useSchedulingHistory(id);
  const run = useSchedulingMutation(({ action, body }) =>
    schedulingAction(id, action, body),
  );
  const edit = useSchedulingMutation((body) => schedulingEdit(id, body));

  if (query.isPending || (scenario && setup.isPending))
    return <SchedulingSkeleton />;
  if (query.error || setup.error)
    return (
      <div role="alert" className="alert alert-error">
        {query.error?.message || setup.error?.message}
      </div>
    );
  if (!scenario || !setup.data) return null;

  const backPath = `/perkuliahan/penjadwalan?semester=${scenario.semester_id}&faculty=${scenario.fakultas_id}`;

  return (
    <div className="space-y-4">
      <PageHeader
        title={scenario.nama}
        subtitle={`Versi ${scenario.revision} · Status: ${statuses[scenario.status] || scenario.status}`}
        breadcrumbs={[
          { label: "Perkuliahan" },
          { label: "Penjadwalan Global", path: backPath },
          { label: scenario.nama || "Detail Skenario" },
        ]}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => navigate(backPath)}
            >
              <ArrowLeft size={15} />
              <span>Kembali ke skenario</span>
            </Button>
            <Can I="simulate" a="Penjadwalan">
              {scenario.status !== "published" && (
                <Button
                  variant={active ? "warning" : "primary"}
                  size="sm"
                  className="gap-1.5"
                  disabled={run.isPending}
                  onClick={() =>
                    run.mutate({
                      action: active ? "cancel" : "simulate",
                      body: { revision: scenario.revision },
                    })
                  }
                >
                  {active ? <Square size={14} /> : <Play size={14} />}
                  <span>
                    {active ? "Batalkan simulasi" : "Jalankan simulasi"}
                  </span>
                </Button>
              )}
            </Can>
          </div>
        }
      />

      {active && (
        <div className="alert alert-info">
          Simulasi berjalan pada worker. Anda dapat meninggalkan halaman ini;
          status tersimpan dan diperbarui otomatis.
        </div>
      )}
      {scenario.status === "failed" && (
        <div className="alert alert-error">
          {jobs.data?.find((j) => j.revision === scenario.revision)?.error ||
            "Proses simulasi gagal. Periksa worker dan data, lalu coba ulang."}
        </div>
      )}

      <div
        className="tabs tabs-box w-fit bg-base-200 flex-wrap gap-1"
        aria-label="Bagian penjadwalan"
      >
        {[
          ["result", "Hasil & Persetujuan"],
          ["input", "Kebutuhan & Kunci"],
          ["import", "Jadwal Acuan"],
          ["history", "Riwayat"],
        ].map(([key, text]) => (
          <button
            key={key}
            type="button"
            className={`tab ${tab === key ? "tab-active" : ""}`}
            onClick={() => setTab(key)}
          >
            {text}
          </button>
        ))}
      </div>

      <Card>
        {tab === "result" && (
          <ResultsPanel
            key={`${id}-${scenario.revision}-${scenario.result?.status || ""}`}
            scenario={scenario}
            setup={setup.data}
          />
        )}
        {tab === "input" &&
          (active || scenario.status === "published" ? (
            <div className="alert">
              {active
                ? "Batalkan simulasi sebelum mengubah kebutuhan."
                : "Buat salinan untuk mengubah jadwal yang telah dipublikasikan."}
            </div>
          ) : (
            <Can I="update" a="Penjadwalan">
              <SessionForm
                key={`${id}-${scenario.revision}`}
                setup={setup.data}
                scenario={scenario}
                busy={edit.isPending}
                onSave={(body) =>
                  edit.mutate({ revision: scenario.revision, ...body })
                }
              />
            </Can>
          ))}
        {tab === "import" &&
          (active || scenario.status === "published" ? (
            <div className="alert">
              Impor tersedia pada draf yang tidak sedang diproses. Buat salinan
              jika jadwal sudah dipublikasikan.
            </div>
          ) : (
            <ImportPanel
              key={`${id}-${scenario.revision}`}
              scenario={scenario}
            />
          ))}
        {tab === "history" && (
          <div className="space-y-4">
            <DataTable
              rows={jobs.data || []}
              tableKey="jobs_"
              rowKey={(r) => r.id}
              columns={[
                { key: "revision", header: "Versi" },
                { key: "status", header: "Status pekerjaan" },
                { key: "claimed_at", header: "Mulai" },
                { key: "finished_at", header: "Selesai" },
                { key: "error", header: "Keterangan" },
              ]}
              emptyText="Belum ada simulasi."
            />
            <DataTable
              rows={history.data || []}
              tableKey="history_"
              rowKey={(r) => r.id}
              columns={[
                { key: "revision", header: "Versi" },
                { key: "status", header: "Status" },
                { key: "createdAt", header: "Waktu" },
                {
                  key: "actions",
                  header: "Pemulihan",
                  render: (r) => (
                    <Can I="create" a="Penjadwalan">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={run.isPending || active}
                        onClick={async () => {
                          const value = await run
                            .mutateAsync({
                              action: "fork",
                              body: {
                                nama: `${scenario.nama} · versi ${r.revision}`.slice(
                                  0,
                                  200,
                                ),
                                source_revision: r.revision,
                              },
                            })
                            .catch(() => null);
                          if (value)
                            navigate(`/perkuliahan/penjadwalan/${value.id}`);
                        }}
                      >
                        Salin versi
                      </Button>
                    </Can>
                  ),
                },
              ]}
              emptyText="Belum ada riwayat versi."
            />
            {(jobs.error || history.error) && (
              <p className="text-error">
                {jobs.error?.message || history.error?.message}
              </p>
            )}
          </div>
        )}
      </Card>

      <Can I="create" a="Penjadwalan">
        <Card
          title="Salin Skenario"
          subtitle="Salin versi ini untuk penyusunan berikutnya atau pemulihan melalui persetujuan baru."
        >
          <div className="flex flex-wrap gap-2">
            <input
              className="input input-sm flex-1 min-w-60"
              aria-label="Nama salinan"
              placeholder="Nama skenario salinan"
              value={copyName}
              onChange={(e) => setCopyName(e.target.value)}
              maxLength={200}
            />
            <Button
              size="sm"
              variant="secondary"
              disabled={!copyName.trim() || run.isPending || active}
              onClick={async () => {
                const value = await run
                  .mutateAsync({ action: "fork", body: { nama: copyName } })
                  .catch(() => null);
                if (value) navigate(`/perkuliahan/penjadwalan/${value.id}`);
              }}
            >
              Buat salinan
            </Button>
          </div>
        </Card>
      </Can>
    </div>
  );
}
