const Rule = require('./rule');

const RawRule = class extends Rule {
  async validate(json) {
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

  isValidationModeTargeted() {
    return false;
  }
};


module.exports = RawRule;
