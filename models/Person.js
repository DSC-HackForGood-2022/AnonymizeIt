require("dotenv").config();
let telegram = require("node-telegram-bot-api");

const token = process.env.BOT_TOKEN;
const opt = { polling: false };
const bot = new telegram(token, opt);

class Person {
  constructor(teleId) {
    this.teleId = teleId;
  }

  async send(recepient, message) {
    const address = recepient.teleId;
    await bot.sendMessage(address, message, { parse_mode: "HTML" });
  }
}

module.exports.Person = Person;
