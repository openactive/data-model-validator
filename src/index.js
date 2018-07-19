/*!
 * data-model-validator
 * MIT Licensed
 */
const validate = require('./validate');

function createValidator() {
  const root = {
    validate,
  };
  return root;
}

module.exports = createValidator();
