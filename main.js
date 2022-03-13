require("dotenv").config();
const telegram = require("node-telegram-bot-api");
const botFunctions = require("./botFunctions");
const crypto = require("crypto");

const token = process.env.BOT_TOKEN;
const opt = { polling: true };
const bot = new telegram(token, opt);

const { Person } = require("./models/Person");
const { Session } = require("./models/Session");

let currentSessions = [];

function addSession(session) {
  const idOne = session.personOne.teleId;
  const filteredSessions = currentSessions.filter((item) =>
    item.containsId(idOne)
  );
  if (filteredSessions.length != 0) {
    return false;
  }
  currentSessions.push(session);
  return true;
}

function isSession(key) {
  const filteredSessions = currentSessions.filter((item) => item.key == key);
  if (filteredSessions.length == 0) {
    return false;
  }
  return true;
}

function getUserSession(teleId) {
  const filteredSessions = currentSessions.filter((item) =>
    item.containsId(teleId)
  );
  return filteredSessions.length > 0 ? filteredSessions[0] : false;
}

function isInSession(teleId) {
  const filteredSessions = currentSessions.filter((item) =>
    item.containsId(teleId)
  );
  if (filteredSessions.length == 0) {
    return false;
  }
  return true;
}

function joinSession(key, person) {
  const filteredSessions = currentSessions.filter((item) => item.key == key);
  filteredSessions[0].joinSession(person);
}

function endSession(teleId) {
  const filteredSessions = currentSessions.filter(
    (item) => !item.containsId(teleId)
  );
  if (filteredSessions.length == currentSessions.length) {
    return false;
  }
  currentSessions = filteredSessions;
  return true;
}

module.exports = {
  run: async () => {
    console.log("Bot Activated...");
    // Start
    bot.onText(/\/start/, async (msg, match) => {
      const chatId = msg.chat.id;
      const fromId = msg.from.id;

      await botFunctions.help(chatId);
    });

    // Help
    bot.onText(/\/help/, async (msg, match) => {
      const chatId = msg.chat.id;
      const fromId = msg.from.id;

      await botFunctions.help(chatId);
    });

    // Start Session
    bot.onText(/\/beginSession/, async (msg, match) => {
      const chatId = msg.chat.id;
      const fromId = msg.from.id;
      const key = crypto.randomBytes(5).toString("hex");
      const newPerson = new Person(fromId);
      const newSession = new Session(key, newPerson);
      if (!addSession(newSession)) {
        await bot.sendMessage(
          chatId,
          "*Exisiting Session Detected*\n" +
            "You are currently in an exisiting session, please /endSession first.",
          { parse_mode: "markdown" }
        );
        return;
      }

      await bot.sendMessage(
        chatId,
        "*New Session Created*\nSession ID: `" +
          key +
          "`\n\nSend this key to the intended recipient and " +
          "have them join the session with this key.",
        { parse_mode: "markdown" }
      );
    });

    // Join Session
    bot.onText(/\/joinSession (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const fromId = msg.from.id;
      let key = match[1]; // the captured "key"

      if (!isSession(key)) {
        await botFunctions.sessionDoesntExist(chatId);
        return;
      }
      const newPerson = new Person(fromId);
      joinSession(key, newPerson);
      await bot.sendMessage(
        chatId,
        "*Joined Session!*\n/s ### to send your message",
        {
          parse_mode: "markdown",
        }
      );
      const current = getUserSession(fromId);
      await current.sendMsg(
        current.personTwo,
        "<b>Another User Has Joined The Session!</b>\n/s ### to send your message"
      );
    });

    // End Session
    bot.onText(/\/endSession/, async (msg, match) => {
      const chatId = msg.chat.id;
      const fromId = msg.from.id;
      if (!isInSession(fromId)) {
        await botFunctions.sessionDoesntExist(chatId);
        return;
      }
      const current = getUserSession(fromId);
      await current.sendMsg(
        new Person(fromId),
        "Other User is Ending Session..."
      );
      endSession(fromId);
      await bot.sendMessage(chatId, "*Ended Session!*", {
        parse_mode: "markdown",
      });
    });

    // Send Message
    bot.onText(/\/s (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const fromId = msg.from.id;
      const message = match[1];

      if (!isInSession(fromId)) {
        await botFunctions.sessionDoesntExist(chatId);
        return;
      }
      const current = getUserSession(fromId);
      await current.sendMsg(new Person(fromId), message);
    });
  },
};
