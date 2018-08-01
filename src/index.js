/*!
 * data-model-validator
 * MIT Licensed
 */
const defaultRules = require('./rules');
const validate = require('./validate');

function createValidator() {
  const root = {
    defaultRules,
    validate,
  };
  return root;
}

module.exports = createValidator();
