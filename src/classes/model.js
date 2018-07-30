const PropertyHelper = require('../helpers/property');
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

  get subClassGraph() {
    return this.data.subClassGraph || [];
  }

  get commonTypos() {
    return this.data.commonTypos || {};
  }

  get requiredFields() {
    return this.data.requiredFields || [];
  }

  hasRequiredField(field) {
    return PropertyHelper.arrayHasField(this.requiredFields, field);
  }

  get requiredOptions() {
    return this.data.requiredOptions || [];
  }

  get recommendedFields() {
    return this.data.recommendedFields || [];
  }

  hasRecommendedField(field) {
    return PropertyHelper.arrayHasField(this.recommendedFields, field);
  }

  get inSpec() {
    return this.data.inSpec || [];
  }

  hasFieldInSpec(field) {
    return PropertyHelper.arrayHasField(this.inSpec, field);
  }

  getField(field) {
    const fieldData = PropertyHelper.getObjectField(this.fields, field);
    if (typeof fieldData === 'undefined') {
      return undefined;
    }
    return new Field(fieldData);
  }

  getPossibleModelsForField(field) {
    const fieldObj = this.getField(field);
    if (typeof fieldObj === 'undefined') {
      return [];
    }
    return fieldObj.getPossibleModels();
  }

  get fields() {
    return this.data.fields || {};
  }

  hasField(field) {
    return PropertyHelper.objectHasField(this.fields, field);
  }
};

module.exports = Model;
