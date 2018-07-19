

const ValidationErrorMessage = require('./validation-error-message');

const ValidationError = class {
  constructor(data) {
    this.data = data;
    if (
      (
        typeof (this.data.message) === 'undefined'
        || this.data.message === null
      )
      && typeof (this.data.type) !== 'undefined'
      && typeof (ValidationErrorMessage[this.data.type]) !== 'undefined'
    ) {
      this.data.message = ValidationErrorMessage[this.data.type];
    }
  }

  get category() {
    return this.data.category;
  }

  get type() {
    return this.data.type;
  }

  get message() {
    return this.data.message;
  }

  get severity() {
    return this.data.severity;
  }

  set path(path) {
    this.data.path = path;
  }

  get path() {
    return this.data.path;
  }

  get value() {
    return this.data.value;
  }
};

module.exports = ValidationError;
