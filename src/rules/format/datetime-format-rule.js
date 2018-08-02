const moment = require('moment');
const Rule = require('../rule');
const Field = require('../../classes/field');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class DatetimeFormatRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'DatetimeFormatRule',
      description: 'Validates that DateTime fields are in the correct format.',
      tests: {
        default: {
          message: 'DateTimes should be expressed as ISO 8601 format datetimes with a trailing definition of timezone. For example, 2018-08-01T10:51:02Z or 2018-08-01T10:51:02+01:00.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_FORMAT,
        },
      },
    };
  }

  validateField(node, field) {
    const errors = [];
    let fieldObj;
    if (node.model.hasSpecification) {
      fieldObj = node.model.getField(field);
      if (typeof fieldObj === 'undefined') {
        return [];
      }
    } else {
      fieldObj = new Field();
    }

    const fieldValue = node.getValue(field);
    const type = fieldObj.detectType(fieldValue);
    if (type === 'http://schema.org/DateTime'
        || fieldObj.isOnlyType('http://schema.org/DateTime')
    ) {
      if (!moment(fieldValue, 'YYYY-MM-DD\\THH:mm:ssZZ', true).isValid()) {
        errors.push(
          this.createError(
            'default',
            {
              value: fieldValue,
              path: node.getPath(field),
            },
          ),
        );
      }
    }
    return errors;
  }
};
