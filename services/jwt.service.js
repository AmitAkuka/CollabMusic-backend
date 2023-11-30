const jwt = require("jsonwebtoken");
const JWT_SECERT = "ijsdf9oj9ewjmf23o45j25t0iklmf@#@!%!^$#Yrmg403k5jkr2m3rsad";

const getResetPasswordToken = async (oldPassword, dataObj) => {
  try {
    const secret = JWT_SECERT + oldPassword;    
    const token = jwt.sign(dataObj, secret, { expiresIn: "5m" });
    return token;
  } catch (err) {
    throw err;
  }
};

const verifyToken = async (oldPassword, token) => {
  try {
    console.log({ oldPassword, token});
    
    const secret = JWT_SECERT + oldPassword;    
    const verify = jwt.verify(token, secret);
    console.log({ verify });
    
    return verify;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

module.exports = {
    getResetPasswordToken,
    verifyToken
}