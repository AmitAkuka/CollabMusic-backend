const authService = require("./auth.service");
const logger = require("../../services/logger.service");

async function login(req, res) {
  try {
    const credentials = req.body;
    const user = await authService.login(credentials);
    const loginToken = authService.getLoginToken(user);
    logger.info("User login: ", user.username);
    res.cookie("loginToken", loginToken);
    res.status(200).json(user);
  } catch (err) {
    logger.error("Wrong credentials" + err);
    res.status(401).send({ err });
  }
}

async function signup(req, res) {
  try {
    const credentials = req.body;
    console.log('signing up', credentials);
    const account = await authService.signup(credentials);
    logger.debug(
      `auth.route - new account created: ` + JSON.stringify(account)
      );
    console.log(account);
    //login upon signup
    const user = await authService.login(credentials);
    logger.info("User signup:", user);
    const loginToken = authService.getLoginToken(user);
    res.cookie("loginToken", loginToken);
    res.status(200).json(user);
  } catch (err) {
    console.log('failed to signup',err);
    logger.error("Failed to signup " + err);
    res.status(500).send({ err });
  }
}

async function update(req, res) {
  try {
    const { id } = req.params;
    const { password } = req.body;
    await authService.updatePassword(id, password);
    logger.debug(`auth.route - account updated: ${id}`);
    res.status(200).send("Password updated, please login");
  } catch (err) {
    logger.error(`Failed to update user: ${id}` + err);
    res.status(500).send({ err });
  }
}

async function logout(req, res) {
  try {
    res.clearCookie("loginToken");
    res.status(200).send({ msg: "Logged out successfully" });
  } catch (err) {
    res.status(500).send({ err: "Failed to logout" });
  }
}

module.exports = {
  login,
  signup,
  logout,
  update,
};
