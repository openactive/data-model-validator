

class Rule {
  constructor(options) {
    this.options = options;
    this.targetModels = [];
    this.targetFields = {};
    this.description = 'This is a base rule description that should be overridden.';
  }

  validate(nodeToTest) {
    let errors = [];
    // console.log(nodeToTest);
    if (this.isModelTargeted(nodeToTest.model)) {
      errors = errors.concat(this.validateModel(nodeToTest));
    }
    for (const field in nodeToTest.value) {
      if (this.isFieldTargeted(nodeToTest.model, field)) {
        errors = errors.concat(this.validateField(nodeToTest, field));
      }
    }
    return errors;
  }

  validateModel(/* data, model, parent */) {
    throw Error('Model validation rule not implemented');
  }

  validateField(/* data, field, model, parent */) {
    throw Error('Field validation rule not implemented');
  }

  isModelTargeted(model) {
    return (
      this.targetModels === '*'
      || this.targetModels === model.type
      || (
        this.targetModels instanceof Array
        && this.targetModels.indexOf(model.type) >= 0
      )
    );
  }

  isFieldTargeted(model, field) {
    return (
      this.targetFields === '*'
      || (
        typeof this.targetFields === 'object'
        && typeof this.targetFields[model.type] !== 'undefined'
        && (
          this.targetFields[model.type] === '*'
          || this.targetFields[model.type] === field
          || (
            this.targetFields[model.type] instanceof Array
            && this.targetFields[model.type].indexOf(field) >= 0
          )
        )
      )
    );
  }
}

module.exports = Rule;
