const express = require("express");
const router = express.Router();
const authController = require("@/controllers/auth.controller");
const authRequired = require("@/middlewares/authRequired");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/me", authRequired, authController.getMe);
router.post("/logout", authRequired, authController.logout);
router.post("/refresh-token", authController.refreshToken);
router.post("/resend-verification-email", authController.resendVerificationEmail);
router.post("/verify-email", authController.verifyEmail);
router.post("/change-password", authRequired, authController.changePassword);

module.exports = router;
