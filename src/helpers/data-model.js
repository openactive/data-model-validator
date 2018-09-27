const {
  getEnums,
  getFullyQualifiedProperty,
  getMetaData,
  loadEnum,
  loadModel,
} = require('@openactive/data-models');

const DataModelHelper = class {
  static getFullyQualifiedProperty(value, version, contexts = []) {
    if (typeof value === 'undefined') {
      throw Error('Parameter "value" must be defined');
    }
    if (typeof version === 'undefined') {
      throw Error('Parameter "version" must be defined');
    }
    return getFullyQualifiedProperty(value, version, contexts);
  }

  static getEnums(version) {
    if (typeof version === 'undefined') {
      throw Error('Parameter "version" must be defined');
    }
    return getEnums(version);
  }

  static getMetaData(version) {
    if (typeof version === 'undefined') {
      throw Error('Parameter "version" must be defined');
    }
    return getMetaData(version);
  }

  static loadEnum(name, version) {
    if (typeof name === 'undefined') {
      throw Error('Parameter "name" must be defined');
    }
    if (typeof version === 'undefined') {
      throw Error('Parameter "version" must be defined');
    }
    return loadEnum(name, version);
  }

  static loadModel(name, version) {
    if (typeof name === 'undefined') {
      throw Error('Parameter "name" must be defined');
    }
    if (typeof version === 'undefined') {
      throw Error('Parameter "version" must be defined');
    }
    return loadModel(name, version);
  }
};

module.exports = DataModelHelper;
