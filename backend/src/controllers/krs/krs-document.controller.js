"use strict";

const asyncHandler = require("../../middleware/asyncHandler");
const { download } = require("../../helpers/response");
const { downloadOwnKrs } = require("../../services/krs/krs-document.service");

const pdf = asyncHandler(async (req, res) => {
  const file = await downloadOwnKrs(req.params.id, req.user.id);
  return download(res, file);
});

module.exports = { pdf };