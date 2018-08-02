const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class AssumeNoGenderRestrictionRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event'];
    this.meta = {
      name: 'AssumeNoGenderRestrictionRule',
      description: 'Generates a notice for how data consumers will interpret an Event without a valid genderRestriction.',
      tests: {
        default: {
          message: 'Data consumers will assume that there is no gender restriction when no valid genderRestriction is supplied on an Event.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.SUGGESTION,
          type: ValidationErrorType.CONSUMER_ASSUME_NO_GENDER_RESTRICTION,
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
    const testValue = node.getValueWithInheritance('genderRestriction');
    if (typeof testValue === 'undefined'
      || (
        typeof node.model.fields.genderRestriction !== 'undefined'
        && typeof node.model.fields.genderRestriction.options !== 'undefined'
        && node.model.fields.genderRestriction.options.indexOf(testValue) < 0
      )
    ) {
      errors.push(
        this.createError(
          'default',
          {
            value: testValue,
            path: node.getPath('genderRestriction'),
          },
        ),
      );
    }
    return errors;
  }
};
