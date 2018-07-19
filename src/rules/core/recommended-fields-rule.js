const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class RequiredFieldsRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = '*';
    this.description = 'Validates that all recommended fields are present in the JSON data.';
  }

  validateModel(node) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    const errors = [];
    for (const field of node.model.recommendedFields) {
      let testNode = node;
      let isSet = false;
      let loopBusterIndex = 0;
      do {
        if (typeof (testNode.value[field]) !== 'undefined'
            && testNode.value[field] !== null
        ) {
          isSet = true;
        } else {
          // Can we inherit this value?
          testNode = testNode.getInheritNode(field);
        }
        loopBusterIndex += 1;
      } while (!isSet && testNode !== null && loopBusterIndex < 50);

      if (!isSet) {
        errors.push(
          new ValidationError(
            {
              category: ValidationErrorCategory.CONFORMANCE,
              type: ValidationErrorType.MISSING_RECOMMENDED_FIELD,
              value: undefined,
              severity: ValidationErrorSeverity.WARNING,
              path: `${node.getPath()}.${field}`,
            },
          ),
        );
      }
    }
    return errors;
  }
};
