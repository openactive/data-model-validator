/*!
 * data-model-validator
 * MIT Licensed
 */
const defaultRules = require('./rules');
const {
  validate, isRpdeFeed,
} = require('./validate');
const Rule = require('./rules/rule');
const ValidationError = require('./errors/validation-error');
const ValidationErrorCategory = require('./errors/validation-error-category');
const ValidationErrorType = require('./errors/validation-error-type');
const ValidationErrorSeverity = require('./errors/validation-error-severity');

function createValidator() {
  const root = {
    defaultRules,
    isRpdeFeed,
    Rule,
    validate,
    ValidationError,
    ValidationErrorCategory,
    ValidationErrorType,
    ValidationErrorSeverity,
  };
  return root;
}

module.exports = createValidator();
