

const Field = require('./field');

const Model = class {
  constructor(data = {}, hasSpecification = false) {
    this.data = data;
    this.hasSpecification = hasSpecification;
  }

  get type() {
    return this.data.type;
  }

  get hasId() {
    return this.data.hasId || false;
  }

  get idFormat() {
    return this.data.idFormat;
  }

  get sampleId() {
    return this.data.sampleId;
  }

  get requiredFields() {
    return this.data.requiredFields || [];
  }

  hasRequiredField(field) {
    return this.requiredFields.indexOf(field) >= 0;
  }

  get requiredOptions() {
    return this.data.requiredOptions || [];
  }

  get recommendedFields() {
    return this.data.recommendedFields || [];
  }

  hasRecommendedField(field) {
    return this.recommendedFields.indexOf(field) >= 0;
  }

  get inSpec() {
    return this.data.inSpec || [];
  }

  hasFieldInSpec(field) {
    return this.inSpec.indexOf(field) >= 0;
  }

  getPossibleModelsForField(field) {
    if (typeof (this.fields[field]) === 'undefined') {
      return [];
    }
    return (new Field(this.fields[field])).getPossibleModels();
  }

  get fields() {
    return this.data.fields || {};
  }
};

module.exports = Model;
