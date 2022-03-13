require("dotenv").config();
let telegram = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const opt = { polling: false };
const bot = new telegram(token, opt);

module.exports = {
  help: async (chatId) => {
    await bot.sendMessage(
      chatId,
      "<b>Help</b>\n" +
        "/beginSession - Create a new Interview Session\n" +
        "/joinSession ### - Join an Interview Session\n" +
        "/s ### - Send message to recepient \n" +
        "/endSession - End your current Interview Session",
      { parse_mode: "HTML" }
    );
  },
  sessionDoesntExist: async (chatId) => {
    await bot.sendMessage(
      chatId,
      "*Invalid Session*\nThis session does not exist.",
      { parse_mode: "markdown" }
    );
  },
};
