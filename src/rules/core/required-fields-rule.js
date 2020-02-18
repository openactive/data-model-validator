const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class RequiredFieldsRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = '*';
    this.meta = {
      name: 'RequiredFieldsRule',
      description: 'Validates that all required properties are present in the JSON data.',
      tests: {
        default: {
          message: 'Required property `{{field}}` is missing from `{{model}}`.{{example}}',
          sampleValues: {
            field: 'name',
            model: 'Event',
            example: '',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.MISSING_REQUIRED_FIELD,
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
    const requiredFields = node.model.getRequiredFields(node.options.validationMode, node.name);
    for (const field of requiredFields) {
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
