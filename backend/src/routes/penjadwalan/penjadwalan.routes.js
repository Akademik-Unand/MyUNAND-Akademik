"use strict";
const router = require("express").Router();
const Joi = require("joi");
const { authenticate } = require("../../middleware/auth");
const attachAbility = require("../../middleware/attachAbility");
const checkPermission = require("../../middleware/checkPermission");
const validate = require("../../middleware/validate");
const v = require("../../validations/penjadwalan/penjadwalan.validation");
const c = require("../../controllers/penjadwalan/penjadwalan.controller");
router.use(authenticate, attachAbility);
const allow = (action) => checkPermission(action, "Penjadwalan");
/** All contracts and examples: docs/penjadwalan.md. */
router.get(
  "/setup",
  allow("read"),
  validate({
    query: Joi.object({
      semester_id: Joi.string().uuid().required(),
      fakultas_id: Joi.string().uuid().required(),
    }),
  }),
  c.setup,
);
router.get("/policies", allow("read"), validate({ query: v.list }), c.policies);
router.put(
  "/policies",
  allow("configure"),
  validate({ body: v.policy }),
  c.savePolicy,
);
router.get("/scenarios", allow("read"), validate({ query: v.list }), c.list);
router.post(
  "/scenarios",
  allow("create"),
  validate({ body: v.create }),
  c.create,
);
router.get(
  "/scenarios/:id",
  allow("read"),
  validate({ params: v.idParam }),
  c.get,
);
router.put(
  "/scenarios/:id",
  allow("update"),
  validate({ params: v.idParam, body: v.edit }),
  c.edit,
);
router.post(
  "/scenarios/:id/simulate",
  allow("simulate"),
  validate({ params: v.idParam, body: v.revision }),
  c.simulate,
);
router.post(
  "/scenarios/:id/cancel",
  allow("simulate"),
  validate({ params: v.idParam, body: v.revision }),
  c.cancel,
);
router.get(
  "/scenarios/:id/jobs",
  allow("read"),
  validate({ params: v.idParam }),
  c.jobs,
);
router.post(
  "/scenarios/:id/decisions",
  validate({ params: v.idParam, body: v.decision }),
  (req, res, next) =>
    allow(req.body.action === "review" ? "review" : "approve")(req, res, next),
  c.decide,
);
router.post(
  "/scenarios/:id/publish",
  allow("publish"),
  validate({ params: v.idParam, body: v.revision }),
  c.publish,
);
router.post(
  "/scenarios/:id/fork",
  allow("create"),
  validate({ params: v.idParam, body: v.fork }),
  c.fork,
);
router.get(
  "/scenarios/:id/history",
  allow("read"),
  validate({ params: v.idParam }),
  c.history,
);
router.get(
  "/scenarios/:id/versions/:revision",
  allow("read"),
  validate({
    params: Joi.object({
      id: Joi.string().uuid().required(),
      revision: Joi.number().integer().min(1).required(),
    }),
  }),
  c.version,
);
router.post(
  "/scenarios/:id/import/preview",
  allow("update"),
  validate({ params: v.idParam, body: v.import }),
  c.preview,
);
router.post(
  "/scenarios/:id/import/commit",
  allow("update"),
  validate({ params: v.idParam, body: v.baseline }),
  c.commit,
);
router.get(
  "/scenarios/:id/export",
  allow("read"),
  validate({
    params: v.idParam,
    query: Joi.object({
      format: Joi.string().valid("csv", "xlsx").default("csv"),
      template: Joi.boolean().default(false),
    }),
  }),
  c.export,
);
module.exports = router;
