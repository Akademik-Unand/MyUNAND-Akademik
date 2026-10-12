import { describe, it, expect } from "vitest";
import {
  sessionFormSchema,
  sessionInput,
  policyFormSchema,
} from "./penjadwalan";
const id = "a344331d-e87a-4e51-9efe-6b84f6566d32";
describe("scheduling forms", () => {
  it("requires explicit participant groups and valid windows", () => {
    const value = {
      nama: "FTI",
      sessions: [
        {
          id: "s1",
          kelas_id: id,
          duration: 100,
          frekuensi: "Mingguan",
          groups: "",
          type: "teori",
          facilities: "",
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
      max_seconds: 120,
    };
    expect(sessionFormSchema.safeParse(value).success).toBe(false);
    value.sessions[0].groups = "TI-A";
    expect(sessionFormSchema.safeParse(value).success).toBe(true);
    value.slots[0].jam_selesai = "07:00";
    expect(sessionFormSchema.safeParse(value).success).toBe(false);
  });
  it("maps comma-separated requirements and drops baseline of deleted sessions", () => {
    const input = sessionInput(
      {
        sessions: [
          { id: "s1", groups: "A, B", facilities: "komputer, proyektor" },
        ],
        slots: [],
        max_seconds: 60,
      },
      [{ session_id: "s1" }, { session_id: "deleted" }],
    );
    expect(input.sessions[0].groups).toEqual(["A", "B"]);
    expect(input.sessions[0].facilities).toEqual(["komputer", "proyektor"]);
    expect(input.baseline).toEqual([{ session_id: "s1" }]);
  });
  it("rejects buildings listed as both main and backup", () => {
    expect(
      policyFormSchema.safeParse({
        main_buildings: [id],
        backup_buildings: [id],
        rooms: [],
        travel: [],
        unavailable: [],
        reservations: [],
      }).success,
    ).toBe(false);
  });
});
