const PropertyHelper = require('../helpers/property');
const Field = require('./field');

const Model = class {
  constructor(data = {}, version = null, hasSpecification = false) {
    this.data = data;
    this.version = version;
    this.hasSpecification = hasSpecification;
  }

  get derivedFrom() {
    return this.data.derivedFrom;
  }

  get baseSchemaClass() {
    return this.data.baseSchemaClass;
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

  get isJsonLd() {
    return typeof this.data.isJsonLd === 'undefined' ? true : this.data.isJsonLd;
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

  getImperativeConfiguration(validationMode) {
    if (!this.validationMode) return undefined;
    if (!this.imperativeConfiguration) return undefined;

    const imperativeConfigName = this.validationMode[validationMode];

    if (!imperativeConfigName) return undefined;

    return this.imperativeConfiguration[imperativeConfigName];
  }

  getImperativeConfigurationWithContext(validationMode, containingFieldName) {
    if (!this.validationMode) return undefined;
    if (!this.imperativeConfigurationWithContext) return undefined;

    const contextualImperativeConfigName = this.validationMode[validationMode];

    if (!contextualImperativeConfigName) return undefined;

    const contextualImperativeConfigs = this.imperativeConfigurationWithContext[contextualImperativeConfigName];

    if (!contextualImperativeConfigs) return undefined;

    const contextualImperativeConfig = contextualImperativeConfigs[containingFieldName];

    return contextualImperativeConfig;
  }

  getRequiredFields(validationMode, containingFieldName) {
    const specificContextualImperativeConfiguration = this.getImperativeConfigurationWithContext(validationMode, containingFieldName);
    const specificImperativeConfiguration = this.getImperativeConfiguration(validationMode);

    if (specificContextualImperativeConfiguration && specificContextualImperativeConfiguration.requiredFields) return specificContextualImperativeConfiguration.requiredFields;

    if (specificImperativeConfiguration && specificImperativeConfiguration.requiredFields) return specificImperativeConfiguration.requiredFields;

    return this.data.requiredFields || [];
  }

  hasRequiredField(field) {
    return PropertyHelper.arrayHasField(this.requiredFields, field, this.version);
  }

  getRequiredOptions(validationMode) {
    let options;
    const specificImperativeConfiguration = this.getImperativeConfiguration(validationMode);
    if (typeof specificImperativeConfiguration === 'object') {
      options = specificImperativeConfiguration.requiredOptions;
    } else {
      options = this.data.requiredOptions;
    }
    return options || [];
  }

  getRecommendedFields(validationMode) {
    let fields;
    const specificImperativeConfiguration = this.getImperativeConfiguration(validationMode);
    if (typeof specificImperativeConfiguration === 'object') {
      fields = specificImperativeConfiguration.recommendedFields;
    } else {
      fields = this.data.recommendedFields;
    }
    return fields || [];
  }

  getShallNotIncludeFields(validationMode) {
    const specificImperativeConfiguration = this.getImperativeConfiguration(validationMode);
    if (typeof specificImperativeConfiguration === 'object') {
      const fields = specificImperativeConfiguration.shallNotInclude;
      return fields || [];
    }
    return undefined; // there are no default shallNotInclude fields
  }

  hasRecommendedField(field) {
    return PropertyHelper.arrayHasField(this.recommendedFields, field, this.version);
  }

  get inSpec() {
    return this.data.inSpec || [];
  }

  get notInSpec() {
    return this.data.notInSpec || [];
  }

  hasFieldInSpec(field) {
    return PropertyHelper.arrayHasField(this.inSpec, field, this.version);
  }

  hasFieldNotInSpec(field) {
    return PropertyHelper.arrayHasField(this.notInSpec, field, this.version);
  }

  getField(field) {
    const fieldData = PropertyHelper.getObjectField(this.fields, field, this.version);
    if (typeof fieldData === 'undefined') {
      return undefined;
    }
    return new Field(fieldData, this.version);
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
    return PropertyHelper.objectHasField(this.fields, field, this.version);
  }

  getRenderedExample(field) {
    // Don't fetch examples for models that are not part of the Modelling Spec
    if (this.isJsonLd && this.version) {
      const fieldObj = this.getField(field);
      if (typeof fieldObj !== 'undefined') {
        return fieldObj.getRenderedExample();
      }
    }
    return undefined;
  }

  get validationMode() {
    return this.data.validationMode;
  }

  get imperativeConfiguration() {
    return this.data.imperativeConfiguration;
  }

  get imperativeConfigurationWithContext() {
    return this.data.imperativeConfigurationWithContext;
  }
};

module.exports = Model;
