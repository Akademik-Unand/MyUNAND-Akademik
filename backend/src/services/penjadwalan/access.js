"use strict";
const AppError = require("../../helpers/AppError");
function assertFaculty(ctx, id) {
  if (ctx.scope?.level === "universitas") return;
  if (ctx.scope?.level !== "fakultas" || !ctx.scope.fakultas_ids?.includes(id))
    throw new AppError(
      "Akses penjadwalan dibatasi ke fakultas yang ditugaskan",
      403,
    );
}
function assertCentral(ctx) {
  if (ctx.scope?.level !== "universitas")
    throw new AppError("Tindakan ini hanya untuk pengelola universitas", 403);
}
function assertRevision(item, revision) {
  if (item.revision !== revision)
    throw new AppError(
      "Versi skenario berubah. Muat ulang sebelum melanjutkan.",
      409,
    );
}
module.exports = { assertFaculty, assertCentral, assertRevision };
