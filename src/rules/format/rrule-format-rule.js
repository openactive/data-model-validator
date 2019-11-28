const { rrulestr } = require('rrule');
const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class RruleFormatRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { Schedule: 'byDay', PartialSchedule: 'byDay' };
    this.meta = {
      name: 'RruleFormatRule',
      description: 'Validates that Rrule properties are in the correct format.',
      tests: {
        default: {
          message: 'The values in the array of the `{{field}}` property must be expressed as a valid `BYDAY` component in compliance with [RFC 5455](https://icalendar.org/iCalendar-RFC-5545/3-3-10-recurrence-rule.html) when specified as a string. For example, `"+1MO"`.\n\nOtherwise values must be one of:\n\n{{allowedValues}}.',
          sampleValues: {
            field: 'byDay',
            allowedValues: '<ul><li>`"https://schema.org/Monday"`</li><li>`"https://schema.org/Tuesday"`</li><li>`"https://schema.org/Wednesday"`</li></ul>',
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
    const allowedOptions = PropertyHelper.getEnumOptions('DayOfWeek', node.options.version);
    if (type === 'ArrayOf#https://schema.org/Text') {
      try {
        fieldValue.forEach((value) => {
          if (allowedOptions.indexOf(value) < 0) {
            if (value.indexOf(',') > -1) throw new Error('Must separate components as elements in array');
            rrulestr(`DTSTART:20120201T023000Z\nRRULE:FREQ=WEEKLY;COUNT=5;BYDAY=${value}`);
          }
        });
      } catch (e) {
        errors.push(
          this.createError(
            'default',
            {
              value: fieldValue,
              path: node.getPath(field),
            },
            {
              field,
              allowedValues: `<ul><li>\`"${allowedOptions.join('"`</li><li>`"')}"\`</li></ul>`,
            },
          ),
        );
      }
    }
    return errors;
  }
};
