const nodemailer = require("nodemailer");
const path = require("path");
const ejs = require("ejs");
const fs = require("fs").promises;
const axios = require("axios");


const templatePath = path.join(__dirname, "../views/template.ejs");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function getBase64Image(imagePath) {
  const image = await fs.readFile(imagePath);
  return `data:image/png;base64,${image.toString("base64")}`;
}

const sendTelegramMessage = async (message) => {
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
  const data = {
    chat_id: chatId,
    text: message
  };

  try {
    const response = await axios.post(url, data);
  } catch (error) {
    console.error("Error sending Telegram message:", error.response ? error.response.data : error.message);
  }
};

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
    const telegramMessage = `✅ Successfully sent email to ${name} (${to}) at ${new Date().toLocaleString()}`;
    await sendTelegramMessage(telegramMessage);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    const telegramErrorMessage = `❌ Failed to send email to ${name} (${to})\nError: ${error.message}\nRetries left: ${retries}\nTime: ${new Date().toLocaleString()}`;
    await sendTelegramMessage(telegramErrorMessage);

    if (retries > 0) {
      console.log(`Retrying... (${3 - retries + 1} of 3)`);
      await delay(5000);
      return sendMail(to, name, retries - 1);
    } else {
      console.error(`Failed to send email to ${to} after 3 attempts.`);
      const finalErrorMessage = `❌ Failed to send email to ${name} (${to}) after 3 attempts\nTime: ${new Date().toLocaleString()}`;
      await sendTelegramMessage(finalErrorMessage);
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

  for (const { workEmail, firstName } of batch) {
    try {
      await sendMail(workEmail, firstName);
      await delay(20000);
    } catch (error) {
      console.error(`Failed to send email to ${workEmail}: ${error.message}`);
    }
  }

  processQueue();
};

module.exports = { addEmailsToQueue };
