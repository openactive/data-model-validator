const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class OpenactiveUrlsCorrectRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = '*';
    this.meta = {
      name: 'OpenactiveUrlsCorrectRule',
      description: 'Validates that @context is present in the root node, and that it is the correct format, containing the OA namespace.',
      tests: {
        default: {
          description: 'Validates that the @context url matches the correct scheme and subdomain (https://openactive.io).',
          message: 'When referencing the OpenActive domain, you must start your URLs with https://openactive.io.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_FORMAT,
        },
      },
    };
  }

  validateModel(node) {
    if (!node.model.isJsonLd) {
      return [];
    }
    const errors = [];
    const fieldValue = node.getValue('@context');

    if (typeof fieldValue !== 'undefined') {
      let contexts = [];
      if (typeof fieldValue === 'string') {
        contexts.push(fieldValue);
      } else if (fieldValue instanceof Array) {
        contexts = fieldValue.slice();
      }

      for (const context of contexts) {
        if (context.match(/^https?:\/\/(www.)?openactive\.io/) && !context.match(/^https:\/\/openactive\.io/)) {
          errors.push(
            this.createError(
              'default',
              {
                value: fieldValue,
                path: node.getPath('@context'),
              },
            ),
          );
          break;
        }
      }
    }

    return errors;
  }
};
