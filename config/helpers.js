const unirest = require("unirest");
const nodemailer = require("nodemailer");

const sendSMS = (data) => {
  const request = unirest(
    "POST",
    process.env.FAST2SMS_URL || "https://www.fast2sms.com/dev/bulkV2"
  );
  request.headers({
    authorization: process.env.FAST2SMS_API_KEY,
  });

  request.form({
    message: data.message,
    language: "english",
    route: "q",
    numbers: data.number,
  });

  request.end(function (response) {
    if (response.error) console.log(response);
    console.log(response.body);
    return response.body;
  });
};

const sendMail = (data) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USERNAME,
      pass: process.env.GMAIL_PASSWORD,
    },
  });

  var mailOptions = {
    from: process.env.GMAIL_USERNAME,
    to: data.email,
    subject: data.subject,
    html: data.email_template,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email sent: " + info.response);
      return info.response;
    }
  });
};

module.exports = { sendMail, sendSMS };
