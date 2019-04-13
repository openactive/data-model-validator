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
          message: 'HTML should be stripped from all data before publishing.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.NO_HTML,
        },
      },
    };
  }

  static isHTML(str) {
    // Source: https://stackoverflow.com/a/15459273
    return /<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(str);
  }

  validateFieldSync(node, field) {
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
          'default',
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
