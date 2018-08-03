/*!
 * data-model-validator
 * MIT Licensed
 */
const defaultRules = require('./rules');
const { validate, isRpdeFeed } = require('./validate');

function createValidator() {
  const root = {
    defaultRules,
    isRpdeFeed,
    validate,
  };
  return root;
}

module.exports = createValidator();
