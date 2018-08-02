const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class RecommendedFieldsRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = '*';
    this.meta = {
      name: 'RecommendedFieldsRule',
      description: 'Validates that all recommended fields are present in the JSON data.',
      tests: {
        default: {
          message: 'Recommended field "{{field}}" is missing from "{{model}}".',
          sampleValues: {
            field: 'description',
            model: 'Event',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.MISSING_RECOMMENDED_FIELD,
        },
      },
    };
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
          this.createError(
            'default',
            {
              value: testValue,
              path: node.getPath(field),
            },
            {
              field,
              model: node.model.type,
            },
          ),
        );
      }
    }
    return errors;
  }
};
