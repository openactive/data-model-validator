const moment = require('moment');
const Rule = require('../rule');
const Field = require('../../classes/field');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class DateFormatRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.description = 'Validates that Date fields are in the correct format.';
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

    const type = fieldObj.detectType(node.value[field]);
    if (type === 'http://schema.org/Date'
        || fieldObj.isOnlyType('http://schema.org/Date')
    ) {
      if (
        !moment(node.value[field], 'YYYY-MM-DD', true).isValid()
        && !moment(node.value[field], 'YYYYMMDD', true).isValid()
      ) {
        errors.push(
          new ValidationError(
            {
              category: ValidationErrorCategory.CONFORMANCE,
              type: ValidationErrorType.INVALID_FORMAT,
              message: 'Dates should be expressed as ISO 8601 dates',
              value: node.value[field],
              severity: ValidationErrorSeverity.FAILURE,
              path: `${node.getPath()}.${field}`,
            },
          ),
        );
      }
    }
    return errors;
  }
};
