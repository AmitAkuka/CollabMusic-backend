const nodemailer = require("nodemailer");
const loggerService = require("./logger.service");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || "CollabMusicNoReply@gmail.com",
    pass: process.env.EMAIL_PASS || "ehvozrsunrgvmhcn",
  },
});

async function sendMail(recieverEmail, mailContent) {
  try {
    const info = await transporter.sendMail({
      from: "CollabMusicNoReply@gmail.com",
      to: recieverEmail,
      subject: "Reset Password Link",
      text: `Need a new password?
      No worries. Click the link below to reset and choose a new one.
      ${mailContent}`,
    });
    loggerService.info(`Email ${info.messageId} sent to: ${recieverEmail}`);
    return info.messageId;
  } catch (err) {
    throw err;
  }
}

module.exports = {
  sendMail,
};
