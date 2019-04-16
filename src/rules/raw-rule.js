const Rule = require('./rule');

const RawRule = class extends Rule {
  async validateAsync(json) {
    return await this.validateRawAsync(json);
  }

  /**
   * @deprecated since version 1.2.0, since it uses synchronous IO
   *   (https://nodejs.org/en/docs/guides/blocking-vs-non-blocking/#comparing-code). Use
   *   validateAsync() instead
   */
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
