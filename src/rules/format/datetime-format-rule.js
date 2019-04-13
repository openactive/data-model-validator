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
      description: 'Validates that DateTime properties are in the correct format.',
      tests: {
        default: {
          message: 'DateTimes must be expressed as ISO 8601 format datetimes with a trailing definition of timezone. For example, `"2018-08-01T10:51:02Z"` or `"2018-08-01T10:51:02+01:00"`.\n\nFor more information, see [the specification](https://www.w3.org/2017/08/realtime-paged-data-exchange/#date-and-time-formats).',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_FORMAT,
        },
      },
    };
  }

  validateFieldSync(node, field) {
    const errors = [];
    let fieldObj;
    if (node.model.hasSpecification) {
      fieldObj = node.model.getField(field);
      if (typeof fieldObj === 'undefined') {
        return [];
      }
    } else {
      fieldObj = new Field({}, node.options.version);
    }

    const fieldValue = node.getValue(field);
    const type = fieldObj.detectType(fieldValue);
    if (type === 'https://schema.org/DateTime'
        || fieldObj.isOnlyType('https://schema.org/DateTime')
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
