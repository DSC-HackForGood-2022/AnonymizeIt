class Session {
  constructor(key, personOne) {
    this.key = key;
    this.personOne = personOne;
  }

  joinSession(personTwo) {
    this.personTwo = personTwo;
  }

  async sendMsg(sender, message) {
    const recepient =
      this.personOne.teleId == sender.teleId ? this.personTwo : this.personOne;
    await sender.send(recepient, message);
  }

  containsId(teleId) {
    return this.personOne.teleId == teleId || this.personTwo.teleId == teleId;
  }
}

module.exports.Session = Session;
