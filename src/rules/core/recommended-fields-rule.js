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
      description: 'Validates that all recommended properties are present in the JSON data.',
      tests: {
        default: {
          message: 'Recommended property `{{field}}` is missing from `{{model}}`.{{example}}',
          sampleValues: {
            field: 'description',
            model: 'Event',
            example: '',
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
      let example = '';
      // Don't fetch examples for models that are not part of the Modelling Spec
      if (!node.model.isJsonLd) {
        const fieldObj = node.model.getField(field);
        if (typeof fieldObj === 'undefined') {
          example = fieldObj.getRenderedExample('\n\nA full example looks like this:\n\n');
        }
      }
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
              example,
            },
          ),
        );
      }
    }
    return errors;
  }
};
