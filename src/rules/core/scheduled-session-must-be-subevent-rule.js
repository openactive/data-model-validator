const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ScheduledSessionMustBeSubeventRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['ScheduledSession'];
    this.meta = {
      name: 'ScheduledSessionMustBeSubeventRule',
      description: 'Validates that a ScheduledSession is referenced from a subEvent.',
      tests: {
        default: {
          description: 'Raises a failure if a ScheduledSession is found that isn\'t referenced from a subEvent.',
          message: 'A `ScheduledSession` must be a `subEvent` of another `Event`.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.MODEL_MUST_BE_CHILD,
        },
      },
    };
  }

  validateModel(node) {
    const errors = [];

    if (node.name !== 'subEvent') {
      errors.push(
        this.createError(
          'default',
          {
            value: node.value,
            path: node.getPath(),
          },
        ),
      );
    }

    return errors;
  }
};
