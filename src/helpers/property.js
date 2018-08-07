const modelLoader = require('openactive-data-models');

const PropertyHelper = class {
  static getObjectField(data, property) {
    const keyChecks = this.getPropertyKeyChecks(property);
    let returnValue;
    for (const key in data) {
      if (
        Object.prototype.hasOwnProperty.call(data, key)
        && keyChecks.indexOf(key) >= 0
      ) {
        returnValue = data[key];
      }
    }
    return returnValue;
  }

  static stringMatchesField(data, property) {
    if (typeof data !== 'string' || typeof property === 'undefined') {
      return false;
    }
    const keyChecks = this.getPropertyKeyChecks(property);
    return keyChecks.indexOf(data) >= 0;
  }

  static arrayHasField(data, property) {
    if (
      typeof data !== 'object'
      || !(data instanceof Array)
      || data === null
      || typeof property === 'undefined'
    ) {
      return false;
    }
    const keyChecks = this.getPropertyKeyChecks(property);
    for (const key of data) {
      if (keyChecks.indexOf(key) >= 0) {
        return true;
      }
    }
    return false;
  }

  static objectHasField(data, property) {
    if (
      typeof data !== 'object'
      || data === null
      || typeof property === 'undefined'
    ) {
      return false;
    }
    const keyChecks = this.getPropertyKeyChecks(property);
    for (const key in data) {
      if (
        Object.prototype.hasOwnProperty.call(data, key)
        && keyChecks.indexOf(key) >= 0
      ) {
        return true;
      }
    }
    return false;
  }

  static objectMappedFieldName(data, property) {
    if (
      typeof data !== 'object'
      || data === null
      || typeof property === 'undefined'
    ) {
      return false;
    }
    const keyChecks = this.getPropertyKeyChecks(property);
    for (const key in data) {
      if (
        Object.prototype.hasOwnProperty.call(data, key)
        && keyChecks.indexOf(key) >= 0
      ) {
        return key;
      }
    }
    return undefined;
  }

  static getFullyQualifiedProperty(property) {
    if (typeof property === 'undefined') {
      return undefined;
    }
    if (typeof this.propertyCache === 'undefined') {
      this.propertyCache = {};
    }
    if (typeof this.propertyCache[property] !== 'undefined') {
      return this.propertyCache[property];
    }
    const prop = modelLoader.getFullyQualifiedProperty(property);
    this.propertyCache[property] = prop;
    return prop;
  }

  static getPropertyKeyChecks(property) {
    if (typeof property === 'undefined') {
      return [];
    }
    const prop = this.getFullyQualifiedProperty(property);
    if (typeof prop === 'undefined' || prop === null) {
      return [];
    }
    const keyChecks = [];
    if (
      typeof prop.alias !== 'undefined'
      && prop.alias !== null
    ) {
      keyChecks.push(prop.alias);
    }
    if (
      typeof prop.label !== 'undefined'
      && prop.label !== null
    ) {
      keyChecks.push(prop.label);
      if (
        typeof prop.prefix !== 'undefined'
        && prop.prefix !== null
      ) {
        keyChecks.push(`${prop.prefix}:${prop.label}`);
      }
      if (
        typeof prop.namespace !== 'undefined'
        && prop.namespace !== null
      ) {
        keyChecks.push(`${prop.namespace}${prop.label}`);
      }
    }
    return keyChecks;
  }
};

module.exports = PropertyHelper;
