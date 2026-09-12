"use strict";

const router = require("express").Router();
const { authenticate } = require("../../middleware/auth");
const attachAbility = require("../../middleware/attachAbility");
const checkPermission = require("../../middleware/checkPermission");
const validate = require("../../middleware/validate");
const v = require("../../validations/krs/cross-enrollment.validation");
const c = require("../../controllers/krs/cross-enrollment.controller");

const guard = (action) => [
  authenticate,
  attachAbility,
  checkPermission(action, "CrossEnrollment"),
];

/** GET /cross-enrollment */
router.get("/", ...guard("read"), validate({ query: v.list }), c.list);

/** POST /cross-enrollment/enroll */
router.post(
  "/enroll",
  ...guard("enroll"),
  validate({ body: v.enroll }),
  c.enroll,
);

module.exports = router;
