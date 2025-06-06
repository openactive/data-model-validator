const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ConsistentScheduleRepetitionFrequencyRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event', 'CourseInstance', 'EventSeries', 'HeadlineEvent', 'ScheduledSession', 'SessionSeries', 'Schedule', 'Slot'];
    this.meta = {
      name: 'ConsistentScheduleRepetitionFrequencyRule',
      description: 'Ensures that the repeatFrequency of a Schedule is aligned with the correct frequency specifier: e.g., weekly repetition with a day of the week, monthly repetition with a week specified.',
      tests: {
        default: {
          message: 'repeatFrequency must align with byDay/byWeek/byMonthWeek values of Schedule.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.REPEATFREQUENCY_MISALIGNED,
        },
        norepfreq: {
          message: 'Schedules must contain a repeatFrequency',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.REPEATFREQUENCY_MISALIGNED,
        },
        badrepfreq: {
          message: 'repeatFrequency must conform to ISO 8601 duration values (e.g. "P1W", "P4M", etc.).',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.REPEATFREQUENCY_MISALIGNED,
        },
        dayerr: {
          message: 'Daily repeat frequencies should not have any additional "byDay", "byMonth", or "byMonthDay" attributes.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.REPEATFREQUENCY_MISALIGNED,
        },
        weekerr: {
          message: 'Weekly repeat frequencies need a "byDay" attribute, and no others.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.REPEATFREQUENCY_MISALIGNED,
        },
        montherr: {
          message: 'Monthly repeat frequencies need a "byMonthDay" attribute, and no others.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.REPEATFREQUENCY_MISALIGNED,
        },
      },
    };
  }

  validateModel(node) {
    let repeatFrequency = node.getValue('repeatFrequency');
    const byDay = node.getValue('byDay');
    const byMonth = node.getValue('byMonth');
    const byMonthDay = node.getValue('byMonthDay');
    const errors = [];

    if (typeof repeatFrequency === 'undefined') {
      errors.push(this.createError('norepfreq', {}, { model: node.model.type }));
      return errors;
    }
    // check frequency is valud
    repeatFrequency = repeatFrequency.toLowerCase();
    const regexp = /^p\d(d|w|m)$/;
    if (!regexp.test(repeatFrequency)) {
      errors.push(this.createError('badrepfreq', {}, { model: node.model.type }));
    }

    // if frequency is valid, simple parsing will work
    const period = repeatFrequency.slice(-1);

    switch (period) {
      case 'd':
        if (byDay !== undefined || byMonth !== undefined || byMonthDay !== undefined) {
          errors.push(this.createError('dayerr', {}, { model: node.model.type }));
        }
        break;

      case 'w':
        if (byDay === undefined) {
          errors.push(this.createError('weekerr', {}, { model: node.model.type }));
        } else if (byMonth !== undefined) {
          errors.push(this.createError('weekerr', {}, { model: node.model.type }));
        } else if (byMonthDay !== undefined) {
          errors.push(this.createError('weekerr', {}, { model: node.model.type }));
        }
        break;
      case 'm':
        if (byDay !== undefined) {
          errors.push(this.createError('montherr', {}, { model: node.model.type }));
        } else if (byMonth !== undefined) {
          errors.push(this.createError('montherr', {}, { model: node.model.type }));
        } else if (byMonthDay === undefined) {
          errors.push(this.createError('montherr', {}, { model: node.model.type }));
        }
        break;
      default:
        break;
    }
    return errors;
  }
};
