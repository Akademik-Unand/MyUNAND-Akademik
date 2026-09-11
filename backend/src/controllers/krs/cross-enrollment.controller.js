'use strict';

const asyncHandler = require('../../middleware/asyncHandler');
const { success } = require('../../helpers/response');
const service = require('../../services/krs/cross-enrollment.service');

const list = asyncHandler(async (req, res) => {
  const { rows, pagination } = await service.list(req.query, req.user);
  return success(res, { message: 'Pengajuan lintas prodi berhasil diambil', data: rows, pagination });
});

const act = (fn, message, code = 200) =>
  asyncHandler(async (req, res) => success(res, { code, message, data: await fn(req) }));

module.exports = {
  list,
  enroll: act((r) => service.enroll(r.user.id, r.body), 'Pendaftaran lintas prodi diajukan', 201),
  approvePa: act((r) => service.approvePa(r.params.id, r.user.id, r.body), 'Keputusan dosen PA disimpan'),
};
