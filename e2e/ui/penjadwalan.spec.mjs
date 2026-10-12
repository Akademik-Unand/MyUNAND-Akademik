import { test, expect } from "@playwright/test";
const id = (n) => `00000000-0000-4000-a000-${String(n).padStart(12, "0")}`;
async function prepare(page, { faculty = false } = {}) {
  const semester = {
    id: id(1),
    tahun: 2026,
    jenis_semester_id: id(2),
    jenisSemester: { nama: "Ganjil" },
  };
  const faculties = [{ id: id(3), nama_resmi: "Fakultas Teknologi Informasi" }];
  const buildings = ["F", "G", "B"].map((kode, i) => ({
    id: id(10 + i),
    kode,
    nama: `Gedung ${kode}`,
  }));
  const rooms = buildings.map((b, i) => ({
    id: id(20 + i),
    gedung_id: b.id,
    kode: `${b.kode}101`,
    nama: `Ruang ${b.kode}101`,
    kapasitas: 50,
  }));
  const classes = [
    {
      id: id(30),
      nama: "A",
      program_studi_id: id(31),
      jumlah_peserta_max: 40,
      label: "TI101 Algoritma (A)",
    },
  ];
  const policy = {
    id: id(40),
    config: {
      main_buildings: [buildings[0].id],
      backup_buildings: [buildings[1].id],
      rooms: rooms.slice(0, 2).map((r) => ({
        id: r.id,
        type: "teori",
        facilities: [],
        zone: "Limau Manis",
      })),
      travel: [],
      unavailable: [],
      reservations: [],
    },
  };
  const input = {
    sessions: [
      {
        id: "s1",
        kelas_id: classes[0].id,
        duration: 100,
        frekuensi: "Mingguan",
        groups: ["TI-A"],
        type: "teori",
        facilities: [],
        lock_room: false,
        lock_time: false,
      },
    ],
    slots: [
      {
        hari: "Senin",
        jam_mulai: "08:00",
        jam_selesai: "12:00",
        frekuensi: "Mingguan",
      },
    ],
    baseline: [
      {
        session_id: "s1",
        ruang_id: rooms[0].id,
        hari: "Senin",
        jam_mulai: "08:00",
        jam_selesai: "09:40",
        frekuensi: "Mingguan",
      },
    ],
    max_seconds: 120,
  };
  const assignment = { ...input.baseline[0], ruang_id: rooms[1].id };
  const scenario = {
    id: id(50),
    nama: "Pilot FTI",
    semester_id: semester.id,
    fakultas_id: faculties[0].id,
    revision: 2,
    status: "solved",
    input,
    decisions: [],
    result: {
      status: "FEASIBLE",
      assignments: [assignment],
      comparison: [
        {
          ...assignment,
          baseline: input.baseline[0],
          backup: true,
          changed: true,
          reason: "Usulan gedung cadangan; memerlukan persetujuan pusat",
        },
      ],
    },
  };
  const setup = {
    classes,
    rooms,
    buildings,
    policy,
    schedules: [],
    teachers: [{ kelas_id: classes[0].id, dosen_id: id(60) }],
    lecturers: [{ id: id(60), nama: "Dosen FTI" }],
    programs: [{ id: id(31), nama_resmi: "Informatika" }],
  };
  const user = {
    id: id(70),
    name: faculty ? "Operator FTI" : "Admin Universitas",
    role: faculty ? "admin-fakultas" : "admin-universitas",
    roles: [{ name: faculty ? "admin-fakultas" : "admin-universitas" }],
    permissions: (faculty
      ? ["read", "create", "update", "simulate", "review"]
      : [
          "read",
          "create",
          "update",
          "configure",
          "simulate",
          "review",
          "approve",
          "publish",
        ]
    ).map((a) => `penjadwalan.${a}`),
  };
  const writes = [];
  await page.addInitScript(
    (user) =>
      localStorage.setItem(
        "myunand_auth",
        JSON.stringify({ user, token: "ui-test-only" }),
      ),
    user,
  );
  await page.route("**/api/v1/**", async (route) => {
    const request = route.request(),
      path = new URL(request.url()).pathname.replace("/api/v1", "");
    const reply = (data, status = 200) =>
      route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify({
          status: status < 400 ? "success" : "error",
          data,
          message: status < 400 ? "Berhasil" : "Ditolak",
        }),
      });
    if (request.method() === "GET") {
      if (path === "/auth/me") return reply(user);
      if (path === "/semester") return reply([semester]);
      if (path === "/jenis-semester")
        return reply([{ id: id(2), nama: "Ganjil" }]);
      if (path === "/fakultas") return reply(faculties);
      if (path === "/penjadwalan/setup") return reply(setup);
      if (path === "/penjadwalan/scenarios")
        return route.fulfill({
          contentType: "application/json",
          body: JSON.stringify({
            status: "success",
            data: [scenario],
            pagination: { page: 1, limit: 10, total: 1, totalPages: 1 },
          }),
        });
      if (path === `/penjadwalan/scenarios/${scenario.id}`)
        return reply(scenario);
      return reply([]);
    }
    const body = request.postDataJSON();
    writes.push({ path, body });
    if (path.endsWith("/decisions")) {
      scenario.decisions.push(body);
      return reply(scenario);
    }
    if (path === "/penjadwalan/scenarios") {
      scenario.input = body.input;
      scenario.nama = body.nama;
      scenario.status = "draft";
      scenario.result = null;
      return reply(scenario, 201);
    }
    if (path === "/penjadwalan/policies") {
      setup.policy.config = body.config;
      return reply(setup.policy);
    }
    return reply(scenario);
  });
  return { scenario, setup, writes };
}
test("faculty can review backup proposal but cannot approve or publish it", async ({
  page,
}) => {
  const state = await prepare(page, { faculty: true });
  await page.goto(`/perkuliahan/penjadwalan/${state.scenario.id}`);
  await expect(page.getByRole("heading", { name: "Pilot FTI" })).toBeVisible();
  await expect(page.getByText("Menunggu persetujuan cadangan")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Sahkan versi ini", exact: true }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Publikasikan jadwal", exact: true }),
  ).toHaveCount(0);
  await page
    .getByRole("button", { name: "Setujui tinjauan fakultas", exact: true })
    .click();
  await expect.poll(() => state.writes.length).toBe(1);
  expect(state.writes[0].body).toMatchObject({
    revision: 2,
    action: "review",
    approved: true,
  });
});
test("central publication stays disabled until faculty review and backup approval and ratification exist", async ({
  page,
}) => {
  const state = await prepare(page);
  await page.goto(`/perkuliahan/penjadwalan/${state.scenario.id}`);
  const publish = page.getByRole("button", {
    name: "Publikasikan jadwal",
    exact: true,
  });
  await page
    .getByLabel(
      "Saya sudah meninjau perubahan dan akan mengganti jadwal aktif fakultas pada semester ini.",
    )
    .check();
  await expect(publish).toBeDisabled();
  await expect(page.getByText(/Belum dapat dipublikasikan:/)).toBeVisible();
  await page.getByRole("button", { name: "Setujui", exact: true }).click();
  await page
    .getByRole("button", { name: "Setujui tinjauan fakultas", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Sahkan versi ini", exact: true })
    .click();
  await expect(publish).toBeEnabled();
  expect(state.writes.map((w) => w.body.action)).toEqual([
    "backup",
    "review",
    "approve",
  ]);
});
test("new scenario requires explicit groups and submits real session input", async ({
  page,
}) => {
  const state = await prepare(page);
  await page.goto(
    `/perkuliahan/penjadwalan?semester=${id(1)}&faculty=${id(3)}`,
  );
  await page
    .getByRole("button", { name: "Buat skenario", exact: true })
    .click();
  await page.getByLabel("Nama skenario", { exact: true }).fill("Uji FTI");
  await page.getByRole("button", { name: "Simpan kebutuhan sesi" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "kelompok paket" }),
  ).toBeVisible();
  expect(state.writes).toHaveLength(0);
  await page
    .getByLabel(`Kelompok ${id(30)}_1`, { exact: true })
    .fill("TI-2025-A");
  await page.getByRole("button", { name: "Simpan kebutuhan sesi" }).click();
  await expect.poll(() => state.writes.length).toBe(1);
  expect(state.writes[0].body.input.sessions[0]).toMatchObject({
    kelas_id: id(30),
    duration: 100,
    groups: ["TI-2025-A"],
    type: "teori",
  });
  expect(state.writes[0].body.input.baseline).toEqual([]);
});

test("policy page has a distinct card and guides building selection", async ({
  page,
}) => {
  const state = await prepare(page);
  state.setup.policy.config.main_buildings = [];
  state.setup.policy.config.backup_buildings = [];
  await page.goto(
    `/perkuliahan/penjadwalan?semester=${id(1)}&faculty=${id(3)}`,
  );
  await page
    .getByRole("button", {
      name: "Kebijakan gedung & sumber daya",
      exact: true,
    })
    .click();
  await expect(
    page.getByText("1. Tentukan gedung untuk Fakultas Teknologi Informasi"),
  ).toBeVisible();
  await expect(
    page.getByText(
      "Pilih gedung utama atau cadangan di atas untuk menampilkan ruang yang perlu dilengkapi.",
    ),
  ).toBeVisible();
  const card = page
    .locator(".card")
    .filter({
      has: page.getByRole("heading", {
        name: "Penjadwalan Global",
        exact: true,
      }),
    });
  await expect(card).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await page
    .locator("fieldset")
    .filter({ has: page.locator("legend", { hasText: /^Gedung utama$/ }) })
    .getByRole("checkbox")
    .first()
    .check();
  await expect(
    page.getByRole("textbox", { name: "Jenis F101", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/penjadwalan-policy-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "Simpan kebijakan fakultas" }),
  ).toBeVisible();
  await page.screenshot({
    path: "test-results/penjadwalan-policy-mobile.png",
    fullPage: true,
  });
});
