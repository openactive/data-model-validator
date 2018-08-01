const PropertyHelper = require('../helpers/property');
const ValidationError = require('../errors/validation-error');

class Rule {
  constructor(options) {
    this.options = options;
    this.targetModels = [];
    this.targetFields = {};
    this.meta = {
      name: 'Rule',
      description: 'This is a base rule description that should be overridden.',
      tests: {},
    };
  }

  validate(nodeToTest) {
    let errors = [];
    // console.log(nodeToTest);
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
      )
      || (
        this.targetModels instanceof Array
        && PropertyHelper.arrayHasField(
          this.targetModels,
          model.type,
        )
      )
    );
  }

  isFieldTargeted(model, field) {
    return (
      this.targetFields === '*'
      || (
        typeof this.targetFields === 'object'
        && typeof this.targetFields[model.type] !== 'undefined'
        && (
          this.targetFields[model.type] === '*'
          || PropertyHelper.stringMatchesField(
            this.targetFields[model.type],
            field,
          )
          || (
            this.targetFields[model.type] instanceof Array
            && PropertyHelper.arrayHasField(
              this.targetFields[model.type],
              field,
            )
          )
        )
      )
    );
  }
}

module.exports = Rule;
