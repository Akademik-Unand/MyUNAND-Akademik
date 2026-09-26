"use strict";

const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/auth");
const attachAbility = require("../../middleware/attachAbility");
const checkPermission = require("../../middleware/checkPermission");
const validate = require("../../middleware/validate");
const authValidation = require("../../validations/auth/auth.validation");
const authController = require("../../controllers/auth/auth.controller");

/** POST /auth/login */
router.post(
  "/login",
  validate({ body: authValidation.login }),
  authController.login,
);

/** POST /auth/register */
router.post(
  "/register",
  authenticate,
  attachAbility,
  checkPermission("create", "User"),
  validate({ body: authValidation.register }),
  authController.register,
);

/** GET /auth/me */
router.get("/me", authenticate, authController.me);

/** GET /auth/profile */
router.get("/profile", authenticate, authController.profile);

/** GET /auth/academic-advisor — own student profile, no master-data permission. */
router.get(
  "/academic-advisor",
  authenticate,
  validate({ query: authValidation.academicAdvisor }),
  authController.academicAdvisor,
);

/** PUT /auth/profile */
router.put(
  "/profile",
  authenticate,
  validate({ body: authValidation.updateProfile }),
  authController.updateProfile,
);

/** PUT /auth/change-password */
router.put(
  "/change-password",
  authenticate,
  validate({ body: authValidation.changePassword }),
  authController.changePassword,
);

/** POST /auth/refresh */
router.post(
  "/refresh",
  validate({ body: authValidation.refresh }),
  authController.refresh,
);

/** POST /auth/logout */
router.post(
  "/logout",
  validate({ body: authValidation.logout }),
  authController.logout,
);

module.exports = router;
