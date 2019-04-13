const Rule = require('./rule');

const RawRule = class extends Rule {
  async validateAsync(json) {
    return await this.validateRawAsync(json);
  }

  validateSync(json) {
    return this.validateRawSync(json);
  }

  validateRawSync(/* json */) {
    throw Error('Raw JSON validation rule not implemented');
  }

  async validateRawAsync(json) {
    return this.validateRawSync(json);
  }

  isModelTargeted() {
    return false;
  }

  isFieldTargeted() {
    return false;
  }
};


module.exports = RawRule;
