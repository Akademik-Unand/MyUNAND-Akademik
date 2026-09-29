"use strict";

const AppError = require("./AppError");

const TEACHING_DAYS = new Set([
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
]);

const assertTeachingDay = (day, existingDay) => {
  if (day && !TEACHING_DAYS.has(day) && day !== existingDay) {
    throw new AppError("Jadwal perkuliahan hanya dapat dibuat Senin sampai Jumat", 422);
  }
};

module.exports = { TEACHING_DAYS, assertTeachingDay };
