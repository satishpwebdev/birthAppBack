const path = require("path");
const fs = require("fs").promises;

const getRandomWishMessage = async () => {
  try {
    const jsonFilePath = path.join(__dirname, "../contents/messages.json");
    const fileContent = await fs.readFile(jsonFilePath, "utf-8");
    const data = JSON.parse(fileContent);
    const messages = data.birthdayMessages;
    if (!messages || messages.length === 0) {
      throw new Error("No birthday messages found in the JSON file");
    }
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    return randomMessage;
  } catch (error) {
    console.error("Error fetching random birthday wish:", error);
    throw error;
  }
};
const getRandomColors = async () => {
  try {
    const jsonFilePath = path.join(__dirname, "../contents/messages.json");
    const fileContent = await fs.readFile(jsonFilePath, "utf-8");
    const data = JSON.parse(fileContent);
    const colors = data.colors;
    if (!colors || colors.length === 0) {
      throw new Error("No birthday colors found in the JSON file");
    }
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    return randomColor;
  } catch (error) {
    console.error("Error fetching random colors:", error);
    throw error;
  }
};

module.exports = {getRandomWishMessage, getRandomColors}
