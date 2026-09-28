"use strict";
jest.mock("../../src/services/krs/krs-document.service", () => ({ downloadOwnKrs: jest.fn() }));
jest.mock("../../src/helpers/userAccess", () => ({
  ...jest.requireActual("../../src/helpers/userAccess"),
  getUserAccessById: jest.fn(), collectPermissions: jest.fn(),
}));
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../src/app");
const jwtConfig = require("../../src/config/jwt");
const { getUserAccessById, collectPermissions } = require("../../src/helpers/userAccess");
const { downloadOwnKrs } = require("../../src/services/krs/krs-document.service");
const AppError = require("../../src/helpers/AppError");

const id = "00000000-0000-4000-a000-000000000010";
const endpoint = "/api/v1/krs/" + id + "/pdf";
const token = () => jwt.sign({ id: "current-user", mahasiswa_id: "stale-id", role: "mahasiswa" }, jwtConfig.secret, { expiresIn: "5m" });

describe("GET /krs/:id/pdf", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    getUserAccessById.mockResolvedValue({ id: "current-user", roles: [{ name: "mahasiswa" }], userUnits: [] });
    collectPermissions.mockReturnValue(["krs.read"]);
    downloadOwnKrs.mockResolvedValue({ buffer: Buffer.from("%PDF-test"), filename: "KRS_2211111001_Ganjil_2026-2027.pdf", contentType: "application/pdf" });
  });
  it("memerlukan autentikasi", async () => {
    expect((await request(app).get(endpoint)).status).toBe(401);
    expect(downloadOwnKrs).not.toHaveBeenCalled();
  });
  it("memerlukan permission krs.read", async () => {
    collectPermissions.mockReturnValue([]);
    expect((await request(app).get(endpoint).auth(token(), { type: "bearer" })).status).toBe(403);
    expect(downloadOwnKrs).not.toHaveBeenCalled();
  });
  it("memvalidasi UUID dan menolak pemilihan mahasiswa melalui query", async () => {
    for (const url of ["/api/v1/krs/not-a-uuid/pdf", endpoint + "?mahasiswa_id=other"]) {
      const res = await request(app).get(url).auth(token(), { type: "bearer" });
      expect(res.status).toBe(422);
    }
    expect(downloadOwnKrs).not.toHaveBeenCalled();
  });
  it("mengirim attachment PDF privat menggunakan identitas user dari autentikasi", async () => {
    const res = await request(app).get(endpoint).auth(token(), { type: "bearer" });
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/^application\/pdf/);
    expect(res.headers["content-disposition"]).toContain('attachment; filename="KRS_2211111001_Ganjil_2026-2027.pdf"');
    expect(res.headers["cache-control"]).toBe("private, no-store");
    expect(res.headers["access-control-expose-headers"]).toContain("Content-Disposition");
    expect(res.body.toString()).toBe("%PDF-test");
    expect(downloadOwnKrs).toHaveBeenCalledWith(id, "current-user");
  });
  it.each([403, 404, 409])("mempertahankan error %s sebagai JSON, bukan PDF rusak", async (code) => {
    downloadOwnKrs.mockRejectedValue(new AppError("Dokumen tidak tersedia", code));
    const res = await request(app).get(endpoint).auth(token(), { type: "bearer" });
    expect(res.status).toBe(code);
    expect(res.headers["content-type"]).toMatch(/application\/json/);
    expect(res.body).toMatchObject({ code, status: "error", message: "Dokumen tidak tersedia" });
    expect(res.headers["content-disposition"]).toBeUndefined();
  });
});