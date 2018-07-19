const moment = require('moment');
const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class DateFormatRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event'];
    this.description = 'Validates that startDate is before the endDate of an Event.';
  }

  validateModel(node) {
    if (typeof (node.value.startDate) === 'undefined'
        || typeof (node.value.endDate) === 'undefined'
    ) {
      return [];
    }
    const errors = [];

    const startDate = moment(node.value.startDate, ['YYYY-MM-DD\\THH:mm:ssZZ', 'YYYY-MM-DD', 'YYYYMMDD'], true);
    const endDate = moment(node.value.endDate, ['YYYY-MM-DD\\THH:mm:ssZZ', 'YYYY-MM-DD', 'YYYYMMDD'], true);

    if (!startDate.isValid() || !endDate.isValid()) {
      return [];
    }

    if (startDate > endDate) {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.DATA_QUALITY,
            type: ValidationErrorType.START_DATE_AFTER_END_DATE,
            value: node.value.startDate,
            severity: ValidationErrorSeverity.WARNING,
            path: `${node.getPath()}.startDate`,
          },
        ),
      );
    }

    return errors;
  }
};
