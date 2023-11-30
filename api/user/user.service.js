const dbService = require("../../services/db.service");
const jwtService = require("../../services/jwt.service");
const logger = require("../../services/logger.service");
const ObjectId = require("mongodb").ObjectId;

module.exports = {
  query,
  getUser,
  remove,
  add,
  getById,
  updateUser,
  getResetPasswordLink,
  verifyLink,
};

async function query(filterBy = {}) {
  const criteria = _buildCriteria(filterBy);
  try {
    const collection = await dbService.getCollection("user");
    var users = await collection.find(criteria).toArray();
    users = users.map((user) => {
      delete user.password;
      user.createdAt = ObjectId(user._id).getTimestamp();
      // Returning fake data
      // user.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
      return user;
    });
    return users;
  } catch (err) {
    logger.error("Failed to find users", err);
    throw err;
  }
}

async function getById(userId) {
  try {
    const collection = await dbService.getCollection("user");
    const user = await collection.findOne({ _id: ObjectId(userId) });
    delete user.password;
    return user;
  } catch (err) {
    logger.error(`Failed to find user ${userId}`, err);
    throw err;
  }
}

async function getUser(credentials) {
  try {
    console.log("getuser");
    const collection = await dbService.getCollection("user");
    let user = null;
    if (credentials.username) {
      const { username } = credentials;
      user = await collection.findOne({ username });
      logger.debug(`auth.service - login with username: ${username}`);
    } else if (credentials.email) {
      const { email } = credentials;
      user = await collection.findOne({ email });
      logger.debug(`auth.service - login with email: ${email}`);
    } else {
      const { userId } = credentials;
      user = await collection.findOne({ _id: new ObjectId(userId) });
    }
    if (user?._id) user._id = user._id.toString();
    return user;
  } catch (err) {
    throw err;
  }
}

async function getResetPasswordLink(user) {
  try {
    const { _id, email, password } = user;
    const token = await jwtService.getResetPasswordToken(password, {
      id: _id,
      email,
    });
    const baseURL =
      process.env.NODE_ENV === "production"
        ? "https://your-production-domain.com"
        : "http://localhost:5173";
    //token containing dots which are not allowed in URL so we encode it base64.
    const link = `${baseURL}/reset-password/${btoa(_id)}/${btoa(token)}`;
    return link;
  } catch (err) {
    throw err;
  }
}

async function verifyLink(userId, token) {
  try {
    const user = await getUser({ userId });
    const { password } = user;
    const isVerified = await jwtService.verifyToken(password, token);
    return isVerified;
  } catch (err) {
    throw err;
  }
}

async function remove(userId) {
  try {
    const collection = await dbService.getCollection("user");
    await collection.deleteOne({ _id: ObjectId(userId) });
  } catch (err) {
    logger.error(`Failed to remove user ${userId}`, err);
    throw err;
  }
}

async function updateUser(userId, updateFields) {
  try {
    const collection = await dbService.getCollection("user");
    await collection.updateOne(
      { _id: new ObjectId(userId) },
      { $set: updateFields }
    );
  } catch (err) {
    logger.error(`Failed to update user ${userId}`, err);
    throw err;
  }
}

async function add(user) {
  try {
    const userToAdd = {
      email: user.email,
      username: user.username,
      password: user.password,
      avatar: "base01",
      isDancing: false,
    };
    const collection = await dbService.getCollection("user");
    await collection.insertOne(userToAdd);
    return userToAdd;
  } catch (err) {
    logger.error("Failed to insert new user", err);
    throw err;
  }
}

function _buildCriteria(filterBy) {
  const criteria = {};
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: "i" };
    criteria.$or = [
      {
        username: txtCriteria,
      },
      {
        fullname: txtCriteria,
      },
    ];
  }
  return criteria;
}
