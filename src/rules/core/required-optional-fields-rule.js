const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class RequiredOptionalFieldsRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = '*';
    this.description = 'Validates that all optional fields that are part of a required group are present in the JSON data.';
  }

  validateModel(node) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    const errors = [];
    for (const option of node.model.requiredOptions) {
      if (typeof (option.options) !== 'undefined'
          && option.options instanceof Array
      ) {
        let found = false;

        for (const field of option.options) {
          let testNode = node;
          let loopBusterIndex = 0;
          do {
            if (typeof (testNode.value[field]) !== 'undefined'
                && testNode.value[field] !== null
            ) {
              found = true;
            } else {
              // Can we inherit this value?
              testNode = testNode.getInheritNode(field);
            }
            loopBusterIndex += 1;
          } while (!found && testNode !== null && loopBusterIndex < 50);
          if (found) {
            break;
          }
        }

        if (!found) {
          errors.push(
            new ValidationError(
              {
                category: ValidationErrorCategory.CONFORMANCE,
                type: ValidationErrorType.MISSING_REQUIRED_FIELD,
                message: option.description ? option.description.join(' ') : null,
                value: undefined,
                severity: ValidationErrorSeverity.FAILURE,
                path: `${node.getPath()}.['${option.options.join('\', \'')}']`,
              },
            ),
          );
        }
      }
    }
    return errors;
  }
};
