const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class NoHtmlRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.description = 'Validates that a text field doesn\'t contain HTML.';
  }

  static isHTML(str) {
    // Source: https://stackoverflow.com/a/15459273
    return /<(?=.*? .*?\/ ?>|br|hr|input|!--|wbr)[a-z]+.*?>|<([a-z]+).*?<\/\1>/i.test(str);
  }

  validateField(node, field) {
    if (typeof (node.value[field]) !== 'string') {
      return [];
    }
    const errors = [];
    if (this.constructor.isHTML(node.value[field])) {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.DATA_QUALITY,
            type: ValidationErrorType.NO_HTML,
            value: node.value[field],
            severity: ValidationErrorSeverity.WARNING,
            path: `${node.getPath()}.${field}`,
          },
        ),
      );
    }

    return errors;
  }
};
