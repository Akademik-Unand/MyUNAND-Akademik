import { useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Can } from "../../components/auth/Can";
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
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">Penjadwalan Global</h1>
        <p className="opacity-70 mt-1">
          Pertahankan jadwal acuan, utamakan gedung fakultas, lalu tinjau
          sebelum publikasi.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <label className="fieldset">
          <span className="fieldset-legend">Semester</span>
          <select
            className="select w-full"
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
          <span className="fieldset-legend">Fakultas</span>
          <select
            className="select w-full"
            value={faculty}
            onChange={(e) => select("faculty", e.target.value)}
          >
            <option value="">Pilih fakultas</option>
            {(faculties.data || []).map((f) => (
              <option key={f.id} value={f.id}>
                {f.nama_resmi}
              </option>
            ))}
          </select>
        </label>
      </div>
      {(semesters.error || faculties.error) && (
        <p role="alert" className="text-error">
          {semesters.error?.message || faculties.error?.message}
        </p>
      )}
      <div className="tabs tabs-box">
        <button
          className={`tab ${tab === "list" ? "tab-active" : ""}`}
          onClick={() => setTab("list")}
        >
          Skenario
        </button>
        <Can I="create" a="Penjadwalan">
          <button
            className={`tab ${tab === "new" ? "tab-active" : ""}`}
            onClick={() => setTab("new")}
          >
            Buat skenario
          </button>
        </Can>
        <Can I="configure" a="Penjadwalan">
          <button
            className={`tab ${tab === "policy" ? "tab-active" : ""}`}
            onClick={() => setTab("policy")}
          >
            Kebijakan gedung & sumber daya
          </button>
        </Can>
      </div>
      {tab === "list" ? (
        <DataTable
          resource="penjadwalan-scenarios"
          tableKey="scenario_"
          extraFilter={{
            ...(semester ? { semester_id: semester } : {}),
            ...(faculty ? { fakultas_id: faculty } : {}),
          }}
          rowKey={(r) => r.id}
          columns={[
            { key: "nama", header: "Skenario", sortable: true },
            { key: "revision", header: "Versi", sortable: true },
            {
              key: "status",
              header: "Status",
              sortable: true,
              render: (r) => (
                <span className="badge badge-ghost">
                  {statuses[r.status] || r.status}
                </span>
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
                <button
                  className="btn btn-sm"
                  onClick={() => navigate(`/perkuliahan/penjadwalan/${r.id}`)}
                >
                  Buka skenario
                </button>
              ),
            },
          ]}
          emptyText="Belum ada skenario penjadwalan."
        />
      ) : !semester || !faculty ? (
        <div className="alert">
          Pilih semester dan fakultas terlebih dahulu.
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
        <div className="alert">Belum ada kelas fakultas pada semester ini.</div>
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
  return (
    <div className="space-y-5">
      <button
        className="btn btn-ghost btn-sm"
        onClick={() =>
          navigate(
            `/perkuliahan/penjadwalan?semester=${scenario.semester_id}&faculty=${scenario.fakultas_id}`,
          )
        }
      >
        Kembali ke skenario
      </button>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{scenario.nama}</h1>
          <p className="opacity-70">
            Versi {scenario.revision} ·{" "}
            {statuses[scenario.status] || scenario.status}
          </p>
        </div>
        <Can I="simulate" a="Penjadwalan">
          {scenario.status !== "published" && (
            <button
              className="btn btn-primary"
              disabled={run.isPending}
              onClick={() =>
                run.mutate({
                  action: active ? "cancel" : "simulate",
                  body: { revision: scenario.revision },
                })
              }
            >
              {active ? "Batalkan simulasi" : "Jalankan simulasi"}
            </button>
          )}
        </Can>
      </div>
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
      <div className="tabs tabs-box">
        {[
          ["result", "Hasil & persetujuan"],
          ["input", "Kebutuhan & kunci"],
          ["import", "Jadwal acuan"],
          ["history", "Riwayat"],
        ].map(([key, text]) => (
          <button
            key={key}
            className={`tab ${tab === key ? "tab-active" : ""}`}
            onClick={() => setTab(key)}
          >
            {text}
          </button>
        ))}
      </div>
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
          <ImportPanel key={`${id}-${scenario.revision}`} scenario={scenario} />
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
                    <button
                      className="btn btn-sm"
                      disabled={run.isPending || active}
                      onClick={async () => {
                        const value = await run
                          .mutateAsync({
                            action: "fork",
                            body: {
                              nama: `${scenario.nama} ? versi ${r.revision}`.slice(
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
                    </button>
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
      <Can I="create" a="Penjadwalan">
        <section className="border-t border-base-300 pt-4 space-y-2">
          <p className="text-sm">
            Salin versi ini untuk penyusunan berikutnya atau pemulihan melalui
            persetujuan baru.
          </p>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              aria-label="Nama salinan"
              placeholder="Nama skenario salinan"
              value={copyName}
              onChange={(e) => setCopyName(e.target.value)}
              maxLength={200}
            />
            <button
              className="btn"
              disabled={!copyName.trim() || run.isPending || active}
              onClick={async () => {
                const value = await run
                  .mutateAsync({ action: "fork", body: { nama: copyName } })
                  .catch(() => null);
                if (value) navigate(`/perkuliahan/penjadwalan/${value.id}`);
              }}
            >
              Buat salinan
            </button>
          </div>
        </section>
      </Can>
    </div>
  );
}
