const nodemailer = require("nodemailer");
const path = require("path");
const ejs = require("ejs");
const fs = require("fs").promises;
const axios = require("axios");
const {getRandomWishMessage, getRandomColors} = require('../handlers/randomContent')

const templatePath = path.join(__dirname, "../views/template.ejs");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const getContentType = (fileExtension) => {
  switch (fileExtension.toLowerCase()) {
    case "png":
      return "image/png";
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "gif":
      return "image/gif";
    default:
      return "application/octet-stream";
  }
};

const getRandomImage = async () => {
  try {
    const imagesDir = path.join(__dirname, "../images");
    const files = await fs.readdir(imagesDir);
    const imageFiles = files.filter((file) => /\.(png|jpg|jpeg|gif)$/.test(file));
    if (imageFiles.length === 0) {
      throw new Error("No images found in the folder");
    }
    const randomImage = imageFiles[Math.floor(Math.random() * imageFiles.length)];
    const imagePath = path.join(imagesDir, randomImage);
    return { imagePath, randomImage };
  } catch (error) {
    console.error("Error fetching random image:", error);
    throw error;
  }
};

async function getBase64Image(imagePath) {
  const image = await fs.readFile(imagePath);
  const fileExtension = imagePath.split(".").pop().toLowerCase();
  const mimeType = getContentType(fileExtension);
  return `data:${mimeType};base64,${image.toString("base64")}`;
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
    console.log(response.statusText)
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

    const { imagePath, randomImage } = await getRandomImage();
    const imageBase64 = await getBase64Image(imagePath);
    const birthdayMessage = await getRandomWishMessage();
    const birthdayColor = await getRandomColors();

    const data = ejs.render(template, { name, imageBase64,birthdayMessage, birthdayColor });

    
    const fileExtension = randomImage.split(".").pop();

    const mailOptions = {
      from: `"Parikshit Mundhra" <${process.env.APP_EMAIL}>`,
      to,
      subject: `Happy Birthday, ${name}! 🎉`,
      html: data,
      attachments: [
        {
          filename: randomImage,
          path: imagePath,
          cid: "randomImage",
          contentType: getContentType(fileExtension),
          contentDisposition: "inline"
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${to}: ${info.response}`);
    const telegramMessage = `✅ Successfully sent email to ${name} (${to}) at ${new Date().toLocaleString()} with random image: ${randomImage}`;
    await sendTelegramMessage(telegramMessage);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
    const telegramErrorMessage = `❌ Failed to send email to ${name} (${to})\nError: ${
      error.message
    }\nRetries left: ${retries}\nTime: ${new Date().toLocaleString()}`;
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
