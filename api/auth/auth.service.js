const Cryptr = require("cryptr");
const bcrypt = require("bcryptjs");
const userService = require("../user/user.service");
const logger = require("../../services/logger.service");
const cryptr = new Cryptr(process.env.SECRET1 || "My-Secret-collabmusic-key");

async function login(credentials) {
  try {
    const user = await userService.getUser(credentials);
    if (!user) return Promise.reject("Invalid username or password");

    const match = await bcrypt.compare(credentials.password, user.password);
    if (!match) return Promise.reject("Invalid username or password");
    delete user.password;
    user._id = user._id.toString();
    return user;
  } catch (err) {
    throw err;
  }
}

async function signup({ email, password, username }) {
  const saltRounds = 10;
  logger.debug(
    `auth.service - signup with email: ${email}, username: ${username}`
  );
  if (!email || !password || !username)
    return Promise.reject("Missing required signup information");

  const emailExist = await userService.getUser({ email });
  if (emailExist) return Promise.reject("Email already registered");

  const usernameExist = await userService.getUser({ username });
  if (usernameExist) return Promise.reject("Username already registered");

  const hash = await bcrypt.hash(password, saltRounds);

  return userService.add({
    email,
    password: hash,
    username,
  });
}

async function updatePassword(userId, newPassword) {
  try {
    if (!userId.length || !newPassword.length)
      throw new Error("Missing new password information!");
    const user = await userService.getUser({ userId });
    if (!user) throw new Error("User not found!");
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await userService.updateUser(userId, { password: hashedPassword });
  } catch (err) {
    throw err;
  }
}

function getLoginToken(user) {
  return cryptr.encrypt(JSON.stringify(user));
}

function validateToken(loginToken) {
  try {
    const json = cryptr.decrypt(loginToken);
    const loggedinUser = JSON.parse(json);
    return loggedinUser;
  } catch (err) {
    console.log("Invalid login token");
  }
  return null;
}

module.exports = {
  signup,
  login,
  getLoginToken,
  validateToken,
  updatePassword,
};
