const moment = require('moment');
const Rule = require('../rule');
const Field = require('../../classes/field');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class TimeFormatRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'TimeFormatRule',
      description: 'Validates that Time properties are in the correct format.',
      tests: {
        default: {
          message: 'Times must be expressed as ISO 8601 format times _without_ a trailing definition of timezone. For example, `"12:00"`.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_FORMAT,
        },
        defaultTimezoneDetected: {
          message: 'Times must be expressed as ISO 8601 format times _without_ a trailing definition of timezone. For example, `"12:00"`.\n\nThis time must not contain a timezone designator, and instead must be provided in local time based on the Event location.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_FORMAT,
        },
        leadingZero: {
          message: 'Times must be expressed as ISO 8601 format times _without_ a trailing definition of timezone, but padded with a leading zero. You can fix this error by adding a leading zero to your time. For example:\n\n```\n{\n  "{{prop}}": "0{{time}}"\n}\n```',
          sampleValues: {
            prop: 'startTime',
            time: '9:00',
          },
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
      fieldObj = new Field({}, node.options.version);
    }

    const fieldValue = node.getValue(field);
    const type = fieldObj.detectType(fieldValue);
    if (type === 'https://schema.org/Time'
        || fieldObj.isOnlyType('https://schema.org/Time')
    ) {
      if (!moment(fieldValue, ['HH:mm:ss', 'HH:mm'], true).isValid()) {
        let errorKey = 'default';
        const messageValues = {};
        if (fieldValue.match(/^[0-9]:[0-5][0-9]$/)) {
          errorKey = 'leadingZero';
          messageValues.prop = field;
          messageValues.time = fieldValue;
        } else if (moment(fieldValue, ['HH:mm:ssZZ', 'HH:mmZZ'], true).isValid()) {
          errorKey = 'defaultTimezoneDetected';
        }
        errors.push(
          this.createError(
            errorKey,
            {
              value: fieldValue,
              path: node.getPath(field),
            },
            messageValues,
          ),
        );
      }
    }
    return errors;
  }
};
