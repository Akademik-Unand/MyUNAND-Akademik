"use strict";
const router = require("express").Router();
const { authenticate } = require("../../middleware/auth");
const attachAbility = require("../../middleware/attachAbility");
const checkPermission = require("../../middleware/checkPermission");
const validate = require("../../middleware/validate");
const validation = require("../../validations/perkuliahan/gedung.validation");
const controller = require("../../controllers/perkuliahan/gedung.controller");
const guard = (action) => [
  authenticate,
  attachAbility,
  checkPermission(action, "Gedung"),
];
router.get(
  "/",
  ...guard("read"),
  validate({ query: validation.list }),
  controller.list,
);
router.post(
  "/",
  ...guard("create"),
  validate({ body: validation.create }),
  controller.create,
);
router.post(
  "/:id/restore",
  ...guard("restore"),
  validate({ params: validation.idParam }),
  controller.restore,
);
router.get(
  "/:id",
  ...guard("read"),
  validate({ params: validation.idParam }),
  controller.getById,
);
router.put(
  "/:id",
  ...guard("update"),
  validate({ params: validation.idParam, body: validation.update }),
  controller.update,
);
router.delete(
  "/:id",
  ...guard("delete"),
  validate({ params: validation.idParam }),
  controller.remove,
);
module.exports = router;
