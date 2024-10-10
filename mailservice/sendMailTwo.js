
const nodemailer = require("nodemailer");
const path = require("path");
const ejs = require("ejs");
const fs = require("fs").promises;

const templatePath = path.join(__dirname, "../views/template.ejs");

async function getBase64Image(imagePath) {
  const image = await fs.readFile(imagePath);
  return `data:image/png;base64,${image.toString("base64")}`;
}

const createTransporter = async () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASS
    }
  });
};

const sendMail = async (to, name, retries = 3) => {
  try {
    const transporter = await createTransporter();
    const template = await fs.readFile(templatePath, "utf-8");

    const cake = await getBase64Image(path.join(__dirname, "../images/cake.png"));
    const data = ejs.render(template, { name, cake });

    const mailOptions = {
      from: `"Willowood Chemicals LTD" <${process.env.APP_EMAIL}>`,
      to,
      subject: `Happy Birthday, ${name}! 🎉`,
      html: data,
      attachments: [
        {
          filename: "cake.png",
          path: path.join(__dirname, "../images/cake.png"),
          cid: "cake",
          contentType: "image/png",
          contentDisposition: "inline"
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    if (retries > 0) {
      console.log(`Retrying... (${3 - retries + 1} of 3)`);
      return sendMail(to, name, retries - 1);
    } else {
      console.error(`Failed to send email to ${to} after 3 attempts.`);
      throw error;
    }
  }
};

let emailQueue = [];

const addEmailsToQueue = async (recipients) => {
  if (!Array.isArray(recipients)) {
    throw new Error("Recipients must be an array.");
  }

  const batchSize = 10;
  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize);
    emailQueue.push(batch);
  }
  processQueue();
};

const processQueue = async () => {
  if (emailQueue.length === 0) {
    console.log("All emails have been processed!");
    return;
  }

  const batch = emailQueue.shift();

  console.log(`Processing batch of ${batch.length} emails`);
  console.log(batch);

  await Promise.all(batch.map(({ workEmail, firstName }) => sendMail(workEmail, firstName)));

  setTimeout(() => {
    processQueue();
  }, 2000);
};

module.exports = { addEmailsToQueue };
