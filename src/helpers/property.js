const crypto = require('crypto');
const UriTemplate = require('uritemplate');
const DataModelHelper = require('./data-model');

// Source: adapted from https://gist.github.com/dperini/729294
const URL_REGEX = new RegExp('^'
    // protocol identifier (mandatory)
    // short syntax // not permitted
    + '(?:(?:https?):\\/\\/)'
    + '(?:'
      // IP address dotted notation octets
      // excludes loopback network 0.0.0.0
      // excludes reserved space >= 224.0.0.0
      // excludes network & broadcast addresses
      // (first & last IP address of each class)
      + '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])'
      + '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}'
      + '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))'
    + '|'
      // Include localhost
      + 'localhost'
    + '|'
      // host & domain names, may end with dot
      // can be replaced by a shortest alternative
      // (?![-_])(?:[-\\w\\u00a1-\\uffff]{0,63}[^-_]\\.)+
      + '(?:'
        + '(?:'
          + '[a-z0-9\\u00a1-\\uffff]'
          + '[a-z0-9\\u00a1-\\uffff_-]{0,62}'
        + ')?'
        + '[a-z0-9\\u00a1-\\uffff]\\.'
      + ')+'
      // TLD identifier name, may end with dot
      + '(?:[a-z\\u00a1-\\uffff]{2,}\\.?)'
    + ')'
    // port number (optional)
    + '(?::\\d{2,5})?'
    // resource path (optional)
    + '(?:[/?#]\\S*)?'
  + '$', 'i');

const PropertyHelper = class {
  static getObjectField(data, property, version) {
    const keyChecks = this.getPropertyKeyChecks(property, version);
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

  static stringMatchesField(data, property, version) {
    if (typeof data !== 'string' || typeof property === 'undefined') {
      return false;
    }
    const keyChecks = this.getPropertyKeyChecks(property, version);
    return keyChecks.indexOf(data) >= 0;
  }

  static convertFieldNameToJsonLd(fieldName) {
    if (fieldName === 'type' || fieldName === 'id') {
      return `@${fieldName}`;
    }
    return fieldName;
  }

  static arrayHasField(data, property, version) {
    if (
      typeof data !== 'object'
      || !(data instanceof Array)
      || data === null
      || typeof property === 'undefined'
    ) {
      return false;
    }
    const keyChecks = this.getPropertyKeyChecks(property, version);
    for (const key of data) {
      if (keyChecks.indexOf(key) >= 0) {
        return true;
      }
    }
    return false;
  }

  static objectHasField(data, property, version) {
    if (
      typeof data !== 'object'
      || data === null
      || typeof property === 'undefined'
    ) {
      return false;
    }
    const keyChecks = this.getPropertyKeyChecks(property, version);
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

  static objectMappedFieldName(data, property, version) {
    if (
      typeof data !== 'object'
      || data === null
      || typeof property === 'undefined'
    ) {
      return false;
    }
    const keyChecks = this.getPropertyKeyChecks(property, version);
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

  static isEnum(property, version, contexts = []) {
    if (typeof property === 'undefined') {
      return false;
    }
    if (typeof this.enumCache === 'undefined') {
      this.enumCache = {};
    }
    if (typeof this.enumCache[version] === 'undefined') {
      this.enumCache[version] = DataModelHelper.getEnums(version);
    }
    const prop = this.getFullyQualifiedProperty(property, version, contexts);
    for (const enumKey in this.enumCache[version]) {
      if (Object.prototype.hasOwnProperty.call(this.enumCache[version], enumKey)) {
        if (enumKey === prop.label && this.enumCache[version][enumKey].namespace === prop.namespace) {
          return true;
        }
      }
    }
    return false;
  }

  static getEnumOptions(property, version, contexts = []) {
    if (!this.isEnum(property, version, contexts)) {
      return [];
    }
    const prop = this.getFullyQualifiedProperty(property, version, contexts);
    const enumObj = DataModelHelper.loadEnum(prop.label, version);
    const allowedOptions = [];
    for (const option of enumObj.values) {
      allowedOptions.push(`${enumObj.namespace}${option}`);
    }
    return allowedOptions;
  }

  static getFullyQualifiedProperty(property, version, contexts = []) {
    if (typeof property === 'undefined') {
      return undefined;
    }
    if (typeof this.propertyCache === 'undefined') {
      this.propertyCache = {};
    }
    if (typeof this.propertyCache[version] === 'undefined') {
      this.propertyCache[version] = {};
    }
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(contexts));
    const hashKey = hash.digest('hex');
    if (typeof this.propertyCache[version][hashKey] === 'undefined') {
      this.propertyCache[version][hashKey] = {};
    }
    if (typeof this.propertyCache[version][hashKey][property] !== 'undefined') {
      return this.propertyCache[version][hashKey][property];
    }
    const prop = DataModelHelper.getFullyQualifiedProperty(property, version, contexts);
    this.propertyCache[version][hashKey][property] = prop;
    return prop;
  }

  static getPropertyKeyChecks(property, version) {
    if (typeof property === 'undefined') {
      return [];
    }
    const prop = this.getFullyQualifiedProperty(property, version);
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

  static isUrlTemplate(data) {
    try {
      const template = UriTemplate.parse(data);
      for (const expression of template.expressions) {
        if (expression.constructor.name === 'VariableExpression') {
          return true;
        }
      }
    } catch (e) {
      return false;
    }
    return false;
  }

  static isValidUUID(data) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(data);
  }

  static isUrl(data) {
    return URL_REGEX.test(data);
  }

  static clearCache() {
    this.enumCache = {};
    this.propertyCache = {};
  }
};

module.exports = PropertyHelper;
