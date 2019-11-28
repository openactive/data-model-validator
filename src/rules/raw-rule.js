const Rule = require('./rule');

const RawRule = class extends Rule {
  async validateAsync(json) {
    return this.validateRaw(json);
  }

  async validateRaw(/* json */) {
    throw Error('Raw JSON validation rule not implemented');
  }

  isModelTargeted() {
    return false;
  }

  isFieldTargeted() {
    return false;
  }
};


module.exports = RawRule;
