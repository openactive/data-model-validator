const striptags = require('striptags');
const { AllHtmlEntities } = require('html-entities');

const entities = new AllHtmlEntities();

const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class NoHtmlRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'NoHtmlRule',
      description: 'Validates that a text property doesn\'t contain HTML.',
      tests: {
        default: {
          message: 'HTML must be stripped from all data before publishing, except for the value of the [`beta:formattedDescription`](https://openactive.io/ns-beta/#formattedDescription) property.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.NO_HTML,
        },
        descriptionIncludesHtml: {
          message: 'HTML must be stripped from any value of the `description` property. Consider using [`beta:formattedDescription`](https://openactive.io/ns-beta/#formattedDescription) **in addition** to the `description` property to expose this raw HTML.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.NO_HTML,
        },
      },
    };
  }

  static isHTML(str) {
    return entities.decode(striptags(str)).trim() !== str.trim();
  }

  validateField(node, field) {
    if (field === 'beta:formattedDescription') {
      return [];
    }
    const fieldValue = node.getValue(field);
    if (typeof fieldValue !== 'string') {
      return [];
    }
    const errors = [];
    if (this.constructor.isHTML(fieldValue)) {
      errors.push(
        this.createError(
          field === 'description' ? 'descriptionIncludesHtml' : 'default',
          {
            value: fieldValue,
            path: node.getPath(field),
          },
        ),
      );
    }

    return errors;
  }
};
