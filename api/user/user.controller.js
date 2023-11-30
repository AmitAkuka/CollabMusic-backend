const logger = require("../../services/logger.service");
const userService = require("./user.service");
const mailService = require("../../services/mail.service");

async function getUserById(req, res) {
  try {
    const { id } = req.params;
    if (!id) throw new Error("Missing id");
    const user = await userService.getUser({ userId: id });
    res.status(200).send(user);
  } catch (err) {
    logger.error("Failed to get user", err);
    res.status(500).send({ err: "Failed to get user" });
  }
}

async function getUsers(req, res) {
  try {
    const users = await userService.getUsersToView();
    res.status(200).send(users);
  } catch (err) {
    logger.error("Failed to get users", err);
    res.status(500).send({ err: "Failed to get users" });
  }
}

async function deleteUser(req, res) {
  try {
    const { userId } = req.params;
    await userService.remove(userId);
    res.status(200).send({ msg: "Deleted successfully" });
  } catch (err) {
    logger.error("Failed to delete user", err);
    res.status(500).send({ err: "Failed to delete user" });
  }
}

async function updateUserAvatar(req, res) {
  try {
    const { id } = req.params;
    const { avatar } = req.body;
    await userService.updateUser(id, { avatar });
    res.status(200).send({ msg: "Updated avatar successfully" });
  } catch (err) {
    logger.error("Failed to update user avatar", err);
    res.status(500).send({ err: "Failed to update user avatar" });
  }
}

async function resetPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) throw new Error("Missing email");
    const user = await userService.getUser({ email });
    const link = await userService.getResetPasswordLink(user);
    await mailService.sendMail(email, link);
    logger.info(`Reset password request was sent to: ${email}`);
    res.status(200).send("Email sent successfuly!");
  } catch (err) {
    logger.error("Failed to reset user password", err);
    res.status(500).send({ err: "Failed to reset user password" });
  }
}

async function verifyResetPasswordLink(req, res) {
  try {
    const { userId, token } = req.query;
    console.log("got verifyResetPasswordAttempt", { userId, token });
    const isVerified = await userService.verifyLink(userId, token);
    res.status(200).send({ isVerified });
  } catch (err) {
    logger.error("Failed to verify token", err);
    res.status(500).send({ err: "Failed to verify token" });
  }
}

module.exports = {
  getUserById,
  getUsers,
  deleteUser,
  updateUserAvatar,
  resetPassword,
  verifyResetPasswordLink,
};
