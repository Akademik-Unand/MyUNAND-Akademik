import { describe, expect, it } from "vitest";
import {
  assessmentSaveOperations,
  buildAssessmentMatrix,
  totalAssessmentWeight,
} from "./assessmentMatrix";

const cpmks = [
  {
    id: "root",
    nama_cpmk: "CPMK 1",
    sumberPenilaian: [],
  },
  {
    id: "sub",
    parent_cpmk_id: "root",
    nama_cpmk: "Sub-CPMK 1.1",
    sumberPenilaian: [{ id: "source-1", nama_sumber_penilaian: "Tugas", bobot: 20 }],
  },
  {
    id: "root-2",
    nama_cpmk: "CPMK 2",
    sumberPenilaian: [],
  },
];

describe("assessment matrix", () => {
  it("groups existing assessment components into CPMK columns", () => {
    const matrix = buildAssessmentMatrix(cpmks);
    expect(matrix).toHaveLength(1);
    expect(matrix[0]).toMatchObject({
      nama: "Tugas",
      cells: { sub: { id: "source-1", selected: true, bobot: 20 } },
    });
  });

  it("creates, updates, and deletes mapped source rows from matrix cells", () => {
    const matrix = [
      {
        key: "tugas",
        nama: "Tugas Mingguan",
        cells: {
          sub: { id: "source-1", selected: true, bobot: 25 },
          "root-2": { selected: true, bobot: 10 },
        },
      },
    ];
    expect(assessmentSaveOperations(cpmks, matrix)).toEqual([
      {
        type: "update",
        id: "source-1",
        payload: { cpmk_id: "sub", nama_sumber_penilaian: "Tugas Mingguan", bobot: 25 },
      },
      {
        type: "create",
        payload: { cpmk_id: "root-2", nama_sumber_penilaian: "Tugas Mingguan", bobot: 10 },
      },
    ]);
    expect(totalAssessmentWeight(matrix)).toBe(35);
  });

  it("deletes existing mappings when a matrix cell is unchecked", () => {
    const matrix = [{ key: "tugas", nama: "Tugas", cells: { sub: { id: "source-1", selected: false, bobot: 20 } } }];
    expect(assessmentSaveOperations(cpmks, matrix)).toEqual([{ type: "delete", id: "source-1" }]);
  });
});
