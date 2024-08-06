const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class DeprecatedFieldsRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = '*';
    this.meta = {
      name: 'DeprecatedFieldsRule',
      description: 'Validates that deprecated properties are not present in the JSON data.',
      tests: {
        default: {
          message: 'Deprecated properties must not be used in Open Booking API implementations. {{deprecationGuidance}}',
          sampleValues: {
            deprecationGuidance: 'Field is deprecated.',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_DEPRECATED,
        },
        feed: {
          message: 'This property is deprecated. {{deprecationGuidance}}',
          sampleValues: {
            deprecationGuidance: 'Field is deprecated.',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.FIELD_DEPRECATED,
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

    const deprecatedFields = node.model.getDeprecatedFields();
    for (const field of deprecatedFields) {
      const testValue = node.getValueWithInheritance(field.fieldName);

      if (typeof testValue !== 'undefined') {
        const errorType = node.options.validationMode === 'RPDEFeed' ? 'feed' : 'default';

        errors.push(
          this.createError(
            errorType,
            {
              value: testValue,
              path: node.getPath(field.fieldName),
            },
            {
              deprecationGuidance: field.deprecationGuidance,
            },
          ),
        );
      }
    }
    return errors;
  }
};
