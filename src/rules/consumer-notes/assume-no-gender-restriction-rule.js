const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class AssumeNoGenderRestrictionRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event'];
    this.description = 'Generates a notice if no valid genderRestriction is set on Event.';
  }

  validateModel(node) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    const errors = [];
    if (typeof node.value.genderRestriction === 'undefined'
      || (
        typeof node.model.fields.genderRestriction !== 'undefined'
        && typeof node.model.fields.genderRestriction.options !== 'undefined'
        && node.model.fields.genderRestriction.options.indexOf(node.value.genderRestriction) < 0
      )
    ) {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.DATA_QUALITY,
            type: ValidationErrorType.CONSUMER_ASSUME_NO_GENDER_RESTRICTION,
            value: node.value.genderRestriction,
            severity: ValidationErrorSeverity.NOTICE,
            path: `${node.getPath()}.genderRestriction`,
          },
        ),
      );
    }
    return errors;
  }
};
