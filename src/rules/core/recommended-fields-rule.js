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

  validateModel(node) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    const errors = [];
    for (const field of node.model.recommendedFields) {
      const testValue = node.getValueWithInheritance(field);
      if (typeof testValue === 'undefined') {
        errors.push(
          new ValidationError(
            {
              category: ValidationErrorCategory.CONFORMANCE,
              type: ValidationErrorType.MISSING_RECOMMENDED_FIELD,
              value: undefined,
              severity: ValidationErrorSeverity.WARNING,
              path: `${node.getPath()}.${field}`,
            },
          ),
        );
      }
    }
    return errors;
  }
};
