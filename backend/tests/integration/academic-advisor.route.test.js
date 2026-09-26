"use strict";

jest.mock("../../src/services/auth/academic-advisor.service", () => ({
  getAcademicAdvisor: jest.fn(),
}));
const request = require("supertest");
const jwt = require("jsonwebtoken");
const app = require("../../src/app");
const jwtConfig = require("../../src/config/jwt");
const AppError = require("../../src/helpers/AppError");
const { getAcademicAdvisor } = require("../../src/services/auth/academic-advisor.service");

const endpoint = "/api/v1/auth/academic-advisor";
const token = () => jwt.sign({ id: "current-user", mahasiswa_id: "stale-student" }, jwtConfig.secret, { expiresIn: "5m" });

describe("GET own academic advisor", () => {
  it("requires authentication", async () => {
    const res = await request(app).get(endpoint);
    expect(res.status).toBe(401);
    expect(getAcademicAdvisor).not.toHaveBeenCalled();
  });

  it("uses the authenticated user id rather than a student id from the JWT", async () => {
    getAcademicAdvisor.mockResolvedValue({ status: "unassigned", advisor: null });
    const res = await request(app).get(endpoint).auth(token(), { type: "bearer" });
    expect(res.status).toBe(200);
    expect(getAcademicAdvisor).toHaveBeenCalledWith("current-user");
    expect(res.body.data).toEqual({ status: "unassigned", advisor: null });
    expect(res.body.status).toBe("success");
  });

  it("rejects attempts to select another student's profile via query", async () => {
    const res = await request(app).get(endpoint).query({ mahasiswa_id: "other-student" }).auth(token(), { type: "bearer" });
    expect(res.status).toBe(422);
    expect(getAcademicAdvisor).not.toHaveBeenCalled();
  });

  it("preserves a non-student access denial", async () => {
    getAcademicAdvisor.mockRejectedValue(new AppError("Hanya mahasiswa", 403));
    const res = await request(app).get(endpoint).auth(token(), { type: "bearer" });
    expect(res.status).toBe(403);
  });
});
