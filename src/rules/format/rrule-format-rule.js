const { rrulestr } = require('rrule');
const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class RruleFormatRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { Schedule: 'byDay' };
    this.meta = {
      name: 'RruleFormatRule',
      description: 'Validates that Rrule properties are in the correct format.',
      tests: {
        default: {
          message: 'The `{{field}}` property must be expressed as a valid `BYDAY` component in compliance with [RFC 5455](https://icalendar.org/iCalendar-RFC-5545/3-3-10-recurrence-rule.html) when specified as a string. For example, `"MO,WE,FR"`.',
          sampleValues: {
            field: 'byDay',
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
    if (!node.model.hasSpecification) {
      return [];
    }
    const fieldObj = node.model.getField(field);
    const fieldValue = node.getValue(field);
    const type = fieldObj.detectType(fieldValue);
    if (type === 'https://schema.org/Text') {
      try {
        rrulestr(`DTSTART:20120201T023000Z\nRRULE:FREQ=WEEKLY;COUNT=5;BYDAY=${fieldValue}`);
      } catch (e) {
        // console.log(e);
        errors.push(
          this.createError(
            'default',
            {
              value: fieldValue,
              path: node.getPath(field),
            },
            {
              field,
            },
          ),
        );
      }
    }
    return errors;
  }
};
