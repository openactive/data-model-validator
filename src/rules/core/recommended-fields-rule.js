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


    const recommendedFields = node.model.getRecommendedFields(node.options.validationMode, node.name);
    for (const field of recommendedFields) {
      const testValue = node.getValueWithInheritance(field);
      const example = node.model.getRenderedExample(field);
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
              example: example ? `\n\nA full example looks like this:\n\n${example}` : '',
            },
          ),
        );
      }
    }
    return errors;
  }
};
