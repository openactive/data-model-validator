const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class RequiredFieldsRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = '*';
    this.description = 'Validates that all recommended fields are present in the JSON data.';
  }

  validateModel(data, model /* , parent */) {
    // Don't do this check for models that we don't actually have a spec for
    if (!model.hasSpecification) {
      return [];
    }
    const errors = [];
    for (const field of model.recommendedFields) {
      if (typeof (data[field]) === 'undefined'
          || data[field] === null
      ) {
        errors.push(
          new ValidationError(
            {
              category: ValidationErrorCategory.CONFORMANCE,
              type: ValidationErrorType.MISSING_RECOMMENDED_FIELD,
              value: undefined,
              severity: ValidationErrorSeverity.WARNING,
              path: field,
            },
          ),
        );
      }
    }
    return errors;
  }
};
