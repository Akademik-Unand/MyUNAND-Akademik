"use strict";
const express = require("express");
const request = require("supertest");
jest.mock("../../src/middleware/auth", () => ({
  authenticate: (req, res, next) => {
    if (!req.headers.authorization) return res.sendStatus(401);
    req.user = { id: "user" };
    next();
  },
}));
jest.mock("../../src/middleware/attachAbility", () => (req, res, next) => {
  req.orgScope = { level: "fakultas", fakultas_ids: ["f"] };
  req.ability = {
    can: (action) => req.headers["x-allowed"]?.split(",").includes(action),
  };
  next();
});
jest.mock("../../src/services/penjadwalan/scenario.service", () => ({
  list: jest.fn(),
  create: jest.fn(),
  get: jest.fn(),
  simulate: jest.fn(),
  decide: jest.fn(),
  publish: jest.fn(),
}));
jest.mock("../../src/services/penjadwalan/import.service", () => ({
  preview: jest.fn(),
  commit: jest.fn(),
}));
const service = require("../../src/services/penjadwalan/scenario.service");
const errorHandler = require("../../src/middleware/errorHandler");
const app = express();
app.use(express.json());
app.use(
  "/api/v1/penjadwalan",
  require("../../src/routes/penjadwalan/penjadwalan.routes"),
);
app.use(errorHandler);
const id = "a344331d-e87a-4e51-9efe-6b84f6566d32";
test("authentication and permission are mandatory", async () => {
  expect((await request(app).get("/api/v1/penjadwalan/scenarios")).status).toBe(
    401,
  );
  expect(
    (
      await request(app)
        .get("/api/v1/penjadwalan/scenarios")
        .set("Authorization", "Bearer test")
    ).status,
  ).toBe(403);
  expect(service.list).not.toHaveBeenCalled();
});
test("list keeps pagination envelope and forwards organizational context", async () => {
  service.list.mockResolvedValue({
    rows: [{ id }],
    pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
  });
  const r = await request(app)
    .get("/api/v1/penjadwalan/scenarios?page=1&limit=20")
    .set("Authorization", "Bearer test")
    .set("x-allowed", "read");
  expect(r.status).toBe(200);
  expect(r.body.data).toEqual([{ id }]);
  expect(r.body.pagination.total).toBe(1);
  expect(service.list).toHaveBeenCalledWith(
    expect.objectContaining({ limit: 20 }),
    expect.objectContaining({
      scope: { level: "fakultas", fakultas_ids: ["f"] },
    }),
  );
});
test("invalid revision never reaches simulation service", async () => {
  const r = await request(app)
    .post(`/api/v1/penjadwalan/scenarios/${id}/simulate`)
    .set("Authorization", "Bearer test")
    .set("x-allowed", "simulate")
    .send({ revision: 0 });
  expect(r.status).toBe(422);
  expect(service.simulate).not.toHaveBeenCalled();
});
test("simulation is asynchronous and returns job id", async () => {
  service.simulate.mockResolvedValue({ id: "job", status: "queued" });
  const r = await request(app)
    .post(`/api/v1/penjadwalan/scenarios/${id}/simulate`)
    .set("Authorization", "Bearer test")
    .set("x-allowed", "simulate")
    .send({ revision: 1 });
  expect(r.status).toBe(202);
  expect(r.body.data.id).toBe("job");
});
test("faculty review permission cannot approve central exceptions", async () => {
  const r = await request(app)
    .post(`/api/v1/penjadwalan/scenarios/${id}/decisions`)
    .set("Authorization", "Bearer test")
    .set("x-allowed", "review")
    .send({ revision: 1, action: "backup", session_id: "s1", approved: true });
  expect(r.status).toBe(403);
  expect(service.decide).not.toHaveBeenCalled();
});
test("backup decisions require session id", async () => {
  const r = await request(app)
    .post(`/api/v1/penjadwalan/scenarios/${id}/decisions`)
    .set("Authorization", "Bearer test")
    .set("x-allowed", "approve")
    .send({ revision: 1, action: "backup", approved: true });
  expect(r.status).toBe(422);
});
