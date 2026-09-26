import { beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProfileAcademicAdvisor } from "./ProfileAcademicAdvisor";

const { useAcademicAdvisor } = vi.hoisted(() => ({ useAcademicAdvisor: vi.fn() }));
vi.mock("../../hooks/useAcademicAdvisor", () => ({ useAcademicAdvisor }));

const assigned = {
  isStudent: true, isLinked: true, isPending: false, isError: false,
  isFetching: false, refetch: vi.fn(),
  data: {
    status: "assigned",
    advisor: {
      nama: "Ashadi Hasan, S.TP, M.Tech", nip: "123456",
      program_studi: { nama: "S1 Teknik Pertanian dan Biosistem" },
      tahun_akademik: "2026/2027",
    },
  },
};
const render = (compact = false) => renderToStaticMarkup(<ProfileAcademicAdvisor compact={compact} />);

describe("student advisor information", () => {
  beforeEach(() => useAcademicAdvisor.mockReturnValue(assigned));

  it("shows the current advisor and assignment details in the profile", () => {
    const html = render();
    for (const text of ["Dosen Pembimbing Akademik", "Ashadi Hasan", "123456", "S1 Teknik Pertanian dan Biosistem", "2026/2027"])
      expect(html).toContain(text);
  });

  it("keeps the navbar summary concise", () => {
    const html = render(true);
    expect(html).toContain("Dosen PA");
    expect(html).toContain("Ashadi Hasan");
    expect(html).not.toContain("123456");
    expect(html).not.toContain("2026/2027");
  });

  it.each([false, true])("hides advisor UI for non-students (compact=%s)", (compact) => {
    useAcademicAdvisor.mockReturnValue({ ...assigned, isStudent: false });
    expect(render(compact)).toBe("");
  });

  it("distinguishes unlinked accounts even when the disabled query is pending", () => {
    useAcademicAdvisor.mockReturnValue({ ...assigned, isLinked: false, isPending: true, data: undefined });
    expect(render()).toContain("Akun belum terhubung ke data mahasiswa");
    expect(render()).not.toContain("belum ditetapkan");
  });

  it("handles a missing student link reported by the server", () => {
    useAcademicAdvisor.mockReturnValue({ ...assigned, data: { status: "unlinked", advisor: null } });
    expect(render()).toContain("Akun belum terhubung ke data mahasiswa");
  });

  it("shows a loading skeleton before deciding whether a PA exists", () => {
    useAcademicAdvisor.mockReturnValue({ ...assigned, isPending: true, data: undefined });
    expect(render()).toContain("Memuat dosen PA");
    expect(render()).not.toContain("belum ditetapkan");
  });

  it("explains how to obtain an advisor when none is assigned", () => {
    useAcademicAdvisor.mockReturnValue({ ...assigned, data: { status: "unassigned", advisor: null } });
    expect(render()).toContain("Dosen PA belum ditetapkan");
    expect(render()).toContain("Hubungi program studi");
    expect(render(true)).toContain("Dosen PA belum ditetapkan");
  });

  it("offers retry on errors and does not show stale advisor information", () => {
    useAcademicAdvisor.mockReturnValue({ ...assigned, isError: true });
    expect(render()).toContain("Informasi dosen PA gagal dimuat");
    expect(render()).toContain("Coba lagi");
    expect(render()).not.toContain("Ashadi Hasan");
    expect(render(true)).not.toContain("Coba lagi");
  });

  it("handles missing optional advisor details without undefined text", () => {
    useAcademicAdvisor.mockReturnValue({ ...assigned, data: { status: "assigned", advisor: { nama: "PA" } } });
    expect(render()).not.toContain("undefined");
    expect(render()).toContain("—");
  });
});
