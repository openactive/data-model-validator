const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class RequiredOptionalFieldsRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = '*';
    this.meta = {
      name: 'RequiredOptionalFieldsRule',
      description: 'Validates that all optional properties that are part of a required group are present in the JSON data.',
      tests: {
        default: {
          message: 'When publishing a `{{model}}`, a data publisher must provide one of {{optionalFields}}. For more information see the [Modelling Opportunity Data specification](https://www.openactive.io/modelling-opportunity-data/).',
          sampleValues: {
            optionalFields: '`startDate`, `eventSchedule`',
            model: 'Event',
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
    for (const option of node.model.requiredOptions) {
      if (typeof (option.options) !== 'undefined'
          && option.options instanceof Array
      ) {
        let found = false;

        for (const field of option.options) {
          const testValue = node.getValueWithInheritance(field);
          if (typeof testValue !== 'undefined') {
            found = true;
            break;
          }
        }

        if (!found) {
          errors.push(
            this.createError(
              'default',
              {
                value: undefined,
                path: node.getPath(option.options),
              },
              {
                optionalFields: `\`${option.options.join('`, `')}\``,
                model: node.model.type,
              },
            ),
          );
        }
      }
    }
    return errors;
  }
};
