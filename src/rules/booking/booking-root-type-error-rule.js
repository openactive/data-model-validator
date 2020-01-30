const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class BookingRootTypeErrorRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = '*';
    this.targetValidationModes = [
      'OpenBookingError',
    ];
    this.meta = {
      name: 'BookingRootTypeErrorRule',
      description: 'Validates that the root node is of type derived from OpenBookingError.',
      tests: {
        rootTypeTooGeneric: {
          description: 'Generates a warning if OpenBookingError is used instead of one of its subclasses.',
          message: 'OpenBookingError should not be used for most cases. Try using one of its more specific subclasses instead.',
          category: ValidationErrorCategory.SUGGESTION,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.WRONG_BASE_TYPE,
        },
        rootTypeNotAnError: {
          description: 'Generates an error if the root type is anything other than a subclass of OpenBookingError.',
          message: 'Error responses must be a subclass of `OpenBookingError`.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.WRONG_BASE_TYPE,
        },
      },
    };
  }

  validateModel(node) {
    if (!node.model.isJsonLd) {
      return [];
    }
    const errors = [];
    let testKey;

    // Is this the root node?
    if (node.parentNode === null || !node.parentNode.model.isJsonLd) {
      if (node.model.type === 'OpenBookingError') {
        testKey = 'rootTypeTooGeneric';
      } else if (node.model.subClassGraph.indexOf('OpenBookingError') === -1) {
        testKey = 'rootTypeNotAnError';
      }
    }

    if (testKey) {
      errors.push(
        this.createError(
          testKey,
          {
            value: node.model.type,
            path: node.getPath('@type'),
          },
        ),
      );
    }

    return errors;
  }
};
