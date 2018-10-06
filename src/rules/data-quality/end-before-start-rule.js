const moment = require('moment');
const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class EndBeforeStartRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['Event', 'CourseInstance', 'EventSeries', 'HeadlineEvent', 'ScheduledSession', 'SessionSeries', 'Schedule', 'Slot'];
    this.meta = {
      name: 'EndBeforeStartRule',
      description: 'Validates that startDate is before the endDate of an Event or Schedule.',
      tests: {
        default: {
          message: 'Start date should not be after the end date of `{{model}}`.',
          sampleValues: {
            model: 'Event',
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.START_DATE_AFTER_END_DATE,
        },
      },
    };
  }

  validateModel(node) {
    const evalStartDate = node.getValueWithInheritance('startDate');
    const evalEndDate = node.getValueWithInheritance('endDate');
    if (typeof evalStartDate === 'undefined'
        || typeof evalEndDate === 'undefined'
    ) {
      return [];
    }
    const errors = [];

    const startDate = moment(evalStartDate, ['YYYY-MM-DD\\THH:mm:ssZZ', 'YYYY-MM-DD', 'YYYYMMDD'], true);
    const endDate = moment(evalEndDate, ['YYYY-MM-DD\\THH:mm:ssZZ', 'YYYY-MM-DD', 'YYYYMMDD'], true);

    if (!startDate.isValid() || !endDate.isValid()) {
      return [];
    }

    if (startDate > endDate) {
      errors.push(
        this.createError(
          'default',
          {
            value: evalStartDate,
            path: node.getPath(node.getMappedFieldName('startDate') || 'startDate'),
          },
          {
            model: node.model.type,
          },
        ),
      );
    }

    return errors;
  }
};
