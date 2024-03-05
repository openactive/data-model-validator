const PropertyHelper = require('../helpers/property');
const OptionsHelper = require('../helpers/options');
const ValidationError = require('../errors/validation-error');

class Rule {
  constructor(options) {
    this.options = options || new OptionsHelper();
    /** @type {'*' | string[]} */
    this.targetModels = [];
    /** @type {'*' | {[model: string]: '*' | string[]}} */
    this.targetFields = {};
    /** @type {'*' | string[]} */
    this.targetValidationModes = '*';
    /**
     * @type {{
     *   name: string;
     *   description: string;
     *   tests: {[key: string]: {
     *     description?: string;
     *     message: string;
     *     sampleValues?: { [messageTemplateArg: string], string };
     *     category: string;
     *     severity: string;
     *     type: string;
     *   }}
     * }}
     */
    this.meta = {
      name: 'Rule',
      description: 'This is a base rule description that should be overridden.',
      tests: {},
    };
  }

  async validate(nodeToTest) {
    let errors = [];

    if (!this.isValidationModeTargeted(nodeToTest.options.validationMode)) {
      return errors;
    }

    if (this.isModelTargeted(nodeToTest.model)) {
      const modelErrors = this.validateModel(nodeToTest);
      errors = errors.concat(modelErrors);
    }
    for (const field in nodeToTest.value) {
      if (
        Object.prototype.hasOwnProperty.call(nodeToTest.value, field)
        && this.isFieldTargeted(nodeToTest.model, field)
      ) {
        const fieldErrors = await this.validateField(nodeToTest, field);
        errors = errors.concat(fieldErrors);
      }
    }
    return errors;
  }

  validateModel(/* node */) {
    throw Error('Model validation rule not implemented');
  }

  async validateField(/* node, field */) {
    throw Error('Field validation rule not implemented');
  }

  createError(testKey, extra = {}, messageValues = undefined) {
    const rule = this.meta.tests[testKey];
    let { message } = rule;
    if (typeof messageValues !== 'undefined') {
      for (const key in messageValues) {
        if (Object.prototype.hasOwnProperty.call(messageValues, key)) {
          message = message.replace(new RegExp(`{{${key}}}`, 'g'), messageValues[key]);
        }
      }
    }
    const error = Object.assign(
      extra,
      {
        rule: this.meta.name,
        category: rule.category,
        type: rule.type,
        severity: rule.severity,
        message,
      },
    );
    return new ValidationError(error);
  }

  isModelTargeted(model) {
    return (
      this.targetModels === '*'
      || PropertyHelper.stringMatchesField(
        this.targetModels,
        model.type,
        model.version,
      )
      || (
        this.targetModels instanceof Array
        && PropertyHelper.arrayHasField(
          this.targetModels,
          model.type,
          model.version,
        )
      )
    );
  }

  /**
   * @param {import('../classes/model')} model
   * @param {string} field
   */
  isFieldTargeted(model, field) {
    if (this.targetFields === '*') {
      return true;
    }
    if (typeof this.targetFields === 'object') {
      for (const modelType in this.targetFields) {
        if (Object.prototype.hasOwnProperty.call(this.targetFields, modelType)) {
          if (
            PropertyHelper.stringMatchesField(
              modelType,
              model.type,
              model.version,
            )
            && (
              this.targetFields[modelType] === '*'
              || PropertyHelper.stringMatchesField(
                this.targetFields[modelType],
                field,
                model.version,
              )
              || (
                this.targetFields[modelType] instanceof Array
                && PropertyHelper.arrayHasField(
                  this.targetFields[modelType],
                  field,
                  model.version,
                )
              )
            )
          ) {
            return true;
          }
        }
      }
    }
    return false;
  }

  isValidationModeTargeted(validationMode) {
    if (this.targetValidationModes === '*') return true;

    if (this.targetValidationModes instanceof Array) {
      return this.targetValidationModes.includes(validationMode);
    }

    return false;
  }
}

module.exports = Rule;
