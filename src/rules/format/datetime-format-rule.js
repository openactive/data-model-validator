const moment = require('moment');
const Rule = require('../rule');
const Field = require('../../classes/field');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class DatetimeFormatRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.description = 'Validates that DateTime fields are in the correct format.';
  }

  validateField(data, field, model /* , parent */) {
    const errors = [];
    let fieldObj;
    if (model.hasSpecification) {
      if (typeof (model.fields[field]) === 'undefined') {
        return [];
      }
      fieldObj = new Field(model.fields[field]);
    } else {
      fieldObj = new Field();
    }

    const type = fieldObj.detectType(data[field]);
    if (type === 'http://schema.org/DateTime'
        || fieldObj.isOnlyType('http://schema.org/DateTime')
    ) {
      if (!moment(data[field], 'YYYY-MM-DD\\THH:mm:ssZZ', true).isValid()) {
        errors.push(
          new ValidationError(
            {
              category: ValidationErrorCategory.CONFORMANCE,
              type: ValidationErrorType.INVALID_FORMAT,
              message: 'DateTimes should be expressed as ISO 8601 format datetimes with a trailing definition of timezone',
              value: data[field],
              severity: ValidationErrorSeverity.FAILURE,
              path: field,
            },
          ),
        );
      }
    }
    return errors;
  }
};
