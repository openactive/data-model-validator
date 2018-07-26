const modelLoader = require('openactive-data-models');
const Field = require('./field');

const Model = class {
  constructor(data = {}, hasSpecification = false) {
    this.data = data;
    this.hasSpecification = hasSpecification;
  }

  get derivedFrom() {
    return this.data.derivedFrom;
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

  get hasFlexibleType() {
    return this.data.hasFlexibleType || false;
  }

  get commonTypos() {
    return this.data.commonTypos || {};
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

  static isTypeFlexible(modelName) {
    let modelData = null;
    try {
      modelData = modelLoader.loadModel(modelName);
    } catch (e) {
      modelData = null;
    }
    if (!modelData) {
      return false;
    }
    return modelData.hasFlexibleType || false;
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
