class BaseModule {
  constructor(name) {
    this.name = name;
  }

  // eslint-disable-next-line no-unused-vars
  async send(communication, customer) {
    throw new Error(`${this.name}.send not implemented`);
  }

  ok() {
    return { success: true };
  }

  fail(error) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message };
  }
}

module.exports = BaseModule;
