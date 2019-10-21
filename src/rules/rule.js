const PropertyHelper = require('../helpers/property');
const OptionsHelper = require('../helpers/options');
const ValidationError = require('../errors/validation-error');

class Rule {
  constructor(options) {
    this.options = options || new OptionsHelper();
    this.targetModels = [];
    this.targetFields = {};
    this.targetModes = '*';
    this.meta = {
      name: 'Rule',
      description: 'This is a base rule description that should be overridden.',
      tests: {},
    };
  }

  validate(nodeToTest) {
    let errors = [];

    if (!this.isModeTargeted(nodeToTest.options.mode)) {
      return errors;
    }

    if (this.isModelTargeted(nodeToTest.model)) {
      errors = errors.concat(this.validateModel(nodeToTest));
    }
    for (const field in nodeToTest.value) {
      if (
        Object.prototype.hasOwnProperty.call(nodeToTest.value, field)
        && this.isFieldTargeted(nodeToTest.model, field)
      ) {
        errors = errors.concat(this.validateField(nodeToTest, field));
      }
    }
    return errors;
  }

  validateModel(/* node */) {
    throw Error('Model validation rule not implemented');
  }

  validateField(/* node, field */) {
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

  isModeTargeted(mode) {
    if (this.targetModes === '*') return true;


    if (this.targetModes instanceof Array) {
      return this.targetModes.includes(mode);
    }

    return false;
  }
}

module.exports = Rule;
