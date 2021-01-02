/* ©
  This code is property of Enterprise™.
© */

class CompileError extends Error {
  constructor({
    message, type, value, location,
  }) {
    super(`${message} '${value}' at ${JSON.stringify(location)}`);

    this.compilerMessage = message;
    this.type = type;
    this.value = value;
    this.location = location;
  }
}

module.exports = CompileError;
