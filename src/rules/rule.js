

class Rule {
  constructor(options) {
    this.options = options;
    this.targetModels = [];
    this.targetFields = {};
    this.description = 'This is a base rule description that should be overridden.';
  }

  validate(data, model, parent) {
    let errors = [];
    if (this.isModelTargeted(model)) {
      errors = errors.concat(this.validateModel(data, model, parent));
    }
    for (const field in data) {
      if (this.isFieldTargeted(model, field)) {
        errors = errors.concat(this.validateField(data, field, model, parent));
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
