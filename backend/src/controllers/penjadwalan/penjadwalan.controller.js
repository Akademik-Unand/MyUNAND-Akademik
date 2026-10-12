"use strict";
const asyncHandler = require("../../middleware/asyncHandler");
const { success, download } = require("../../helpers/response");
const service = require("../../services/penjadwalan/scenario.service");
const importer = require("../../services/penjadwalan/import.service");
const ctx = (req) => ({ userId: req.user.id, scope: req.orgScope });
const action = (fn, code = 200) =>
  asyncHandler(async (req, res) => {
    const result = await fn(req, ctx(req));
    let data = result?.toJSON ? result.toJSON() : result;
    if (data?.snapshot !== undefined) data = service.present(data);
    if (data?.payload !== undefined) {
      data = { ...data };
      delete data.payload;
    }
    return success(res, {
      code,
      data,
      message: "Penjadwalan berhasil diproses",
    });
  });
module.exports = {
  setup: action((r, c) =>
    service.setup(r.query.semester_id, r.query.fakultas_id, c),
  ),
  list: asyncHandler(async (req, res) => {
    const { rows, pagination } = await service.list(req.query, ctx(req));
    return success(res, { data: rows, pagination });
  }),
  policies: asyncHandler(async (req, res) => {
    const { rows, pagination } = await service.policies(req.query, ctx(req));
    return success(res, { data: rows, pagination });
  }),
  savePolicy: action((r, c) => service.savePolicy(r.body, c)),
  create: action((r, c) => service.create(r.body, c), 201),
  get: action(async (r, c) =>
    service.present(await service.get(r.params.id, c)),
  ),
  edit: action((r, c) => service.edit(r.params.id, r.body, c)),
  simulate: action(
    (r, c) => service.simulate(r.params.id, r.body.revision, c),
    202,
  ),
  cancel: action((r, c) => service.cancel(r.params.id, r.body.revision, c)),
  jobs: action((r, c) => service.jobs(r.params.id, c)),
  decide: action((r, c) => service.decide(r.params.id, r.body, c)),
  publish: action((r, c) => service.publish(r.params.id, r.body.revision, c)),
  fork: action(
    (r, c) => service.fork(r.params.id, r.body.nama, c, r.body.source_revision),
    201,
  ),
  version: action(async (r, c) =>
    service.present(await service.version(r.params.id, r.params.revision, c)),
  ),
  history: action((r, c) => service.history(r.params.id, c)),
  preview: action(async (r, c) => {
    const data = await importer.preview(r.params.id, r.body, c);
    r.body = { ...r.body, content: "[berkas impor]" };
    return data;
  }),
  commit: action((r, c) => importer.commit(r.params.id, r.body, c)),
  export: asyncHandler(async (req, res) => {
    const item = await service.get(req.params.id, ctx(req));
    const rows = req.query.template
      ? item.input.sessions.map((s) => ({
          session_id: s.id,
          frekuensi: s.frekuensi,
        }))
      : item.result?.assignments || item.input.baseline;
    return download(res, {
      buffer:
        req.query.format === "xlsx"
          ? await importer.spreadsheet(rows)
          : importer.csv(rows),
      filename: `jadwal-${req.query.template ? "template" : item.id}.${req.query.format}`,
      contentType:
        req.query.format === "xlsx"
          ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          : "text/csv; charset=utf-8",
    });
  }),
};
