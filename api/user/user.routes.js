const express = require("express");
const {
  requireAuth,
  requireAdmin,
} = require("../../middlewares/requireAuth.middleware");
const {
  getUsers,
  getUserById,
  deleteUser,
  updateUserAvatar,
  resetPassword,
  verifyResetPasswordLink,
} = require("./user.controller");
const router = express.Router();

router.get("/:id", requireAuth, requireAdmin, getUserById);
router.get("/", requireAuth, requireAdmin, getUsers);
router.get("/forgot-password/verify", verifyResetPasswordLink);
router.post("/forgot-password", resetPassword);
router.delete("/:userId", requireAuth, deleteUser);
router.put("/:id/avatar", requireAuth, updateUserAvatar);

module.exports = router;
