// sendEmail.js
const nodemailer = require("nodemailer");

// Configure the SMTP settings
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // user: 'satishwillowood@gmail.com',
    // pass: 'nish vouu klpz qegy',

    user: process.env.APP_EMAIL,
    pass: process.env.APP_PASS
  }

  // host: "smtp-relay.brevo.com",
  //     port: 587,
  //     secure: false,
  //     auth: {
  //       user: "7d1d03002@smtp-brevo.com",
  //       pass: "dE9pDJPK6TfmqGWN",
  //     },
});

const sendMail = (to, name) => {
  const mailOptions = {
    // from: '"John Doe" sattu3911@gmail.com',
    to,
    subject: `Happy Birthday, ${name}! 🎉`,
    text: `Dear ${name},\n\nWishing you a very Happy Birthday! Enjoy your special day!\n\nBest wishes,\nWillowood Chemicals LTD.`
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(`Error: ${error}`);
    }
    console.log(`Email sent to ${name}: ${info.response}`);
  });
};

module.exports = sendMail;
