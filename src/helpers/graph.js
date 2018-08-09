const DataModelHelper = require('./data-model');

const GraphHelper = class {
  static getClassGraph(spec, classId, version) {
    if (typeof this.cache === 'undefined') {
      this.cache = {};
    }
    if (typeof spec['@id'] !== 'undefined') {
      if (typeof this.cache[spec['@id']] === 'undefined') {
        this.cache[spec['@id']] = {};
      }
      if (typeof this.cache[spec['@id']][classId] !== 'undefined') {
        return this.cache[spec['@id']][classId];
      }
    }
    let classes = [];
    if (typeof spec['@graph'] !== 'undefined') {
      if (spec['@graph'] instanceof Array) {
        for (const item of spec['@graph']) {
          classes = this.processClass(spec, item, classId, version);
          if (classes.length > 0) {
            break;
          }
        }
      }
    } else {
      for (const itemKey in spec) {
        if (Object.prototype.hasOwnProperty.call(spec, itemKey)) {
          if (!itemKey.match(/^@/)) {
            const item = spec[itemKey];
            classes = this.processClass(spec, item, classId, version);
            if (classes.length > 0) {
              break;
            }
          }
        }
      }
    }
    return classes;
  }

  static processClass(spec, item, classId, version) {
    let classes = [];
    const type = this.getProperty(spec, item, '@type', version);
    const id = this.getProperty(spec, item, '@id', version);
    if (
      type === 'rdfs:Class'
      && id === classId
    ) {
      classes.push(classId);
      const subClassOf = this.getProperty(spec, item, 'rdfs:subClassOf', version);
      if (
        typeof subClassOf === 'object'
        && subClassOf !== null
      ) {
        const subClassId = this.getProperty(spec, subClassOf, '@id', version);
        if (typeof subClassId === 'string') {
          classes = classes.concat(this.getClassGraph(spec, subClassId, version));
        }
      }
      if (typeof spec['@id'] !== 'undefined') {
        this.cache[spec['@id']][classId] = classes;
      }
    }
    return classes;
  }

  static isPropertyInClass(spec, typeName, classId, version) {
    const classes = this.getClassGraph(spec, classId, version);
    if (typeof spec['@graph'] !== 'undefined') {
      if (spec['@graph'] instanceof Array) {
        for (const item of spec['@graph']) {
          if (this.isProperty(spec, item, typeName, version)) {
            if (this.processProperty(spec, item, classes, version)) {
              return true;
            }
            return false;
          }
        }
      }
    } else {
      for (const itemKey in spec) {
        if (Object.prototype.hasOwnProperty.call(spec, itemKey)) {
          if (!itemKey.match(/^@/)) {
            const item = spec[itemKey];
            if (this.isProperty(spec, item, typeName, version)) {
              if (this.processProperty(spec, item, classes, version)) {
                return true;
              }
              return false;
            }
          }
        }
      }
    }
    return false;
  }

  static isProperty(spec, item, typeName, version) {
    const type = this.getProperty(spec, item, '@type', version);
    const id = this.getProperty(spec, item, '@id', version);
    if (
      (typeof type === 'undefined' || !this.isPropertyEqual(spec, type, 'rdfs:Class', version))
      && this.isPropertyEqual(spec, id, typeName, version)
    ) {
      return true;
    }
    return false;
  }

  static processProperty(spec, item, classes, version) {
    if (classes.length === 0) {
      return true;
    }
    let includes = this.getProperty(spec, item, 'schema:domainIncludes', version);
    if (typeof includes !== 'undefined') {
      if (!(includes instanceof Array)) {
        includes = [includes];
      }
      for (const include of includes) {
        const includeId = this.getProperty(spec, include, '@id', version);
        if (
          typeof includeId === 'string'
          && classes.indexOf(includeId) >= 0
        ) {
          return true;
        }
      }
      return false;
    }
    return true;
  }

  static getProperty(spec, item, field, version) {
    if (typeof item[field] !== 'undefined') {
      return item[field];
    }
    if (typeof spec['@context'] === 'undefined') {
      return undefined;
    }
    const context = spec['@context'];
    if (field.match(/^@/)) {
      for (const key in context) {
        if (Object.prototype.hasOwnProperty.call(context, key)) {
          if (context[key] === field) {
            if (typeof item[key] !== 'undefined') {
              return item[key];
            }
          }
        }
      }
    } else {
      const metaData = DataModelHelper.getMetaData(version);
      const matches = field.match(/^(([a-zA-Z]+):)?([a-zA-Z0-9]+)$/);
      if (matches !== null && typeof matches[1] !== 'undefined') {
        const prefix = matches[2];
        const unprefixedField = matches[3];
        let namespace = metaData.namespaces[prefix];
        if (typeof namespace === 'undefined'
          && context[prefix] !== 'undefined'
        ) {
          namespace = context[prefix];
        }
        if (typeof item[`${namespace}${unprefixedField}`] !== 'undefined') {
          return item[`${namespace}${unprefixedField}`];
        }
        let localPrefix;
        for (const key in context) {
          if (Object.prototype.hasOwnProperty.call(context, key)) {
            if (context[key] === namespace) {
              localPrefix = key;
              if (typeof item[`${key}:${unprefixedField}`] !== 'undefined') {
                return item[`${key}:${unprefixedField}`];
              }
            } else if (
              typeof localPrefix !== 'undefined'
              && context[key] === `${localPrefix}:${unprefixedField}`
            ) {
              if (typeof item[key] !== 'undefined') {
                return item[key];
              }
            } else if (context[key] === `${namespace}${unprefixedField}`) {
              if (typeof item[key] !== 'undefined') {
                return item[key];
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  static isPropertyEqual(spec, userSupplied, field, version) {
    if (typeof spec['@context'] === 'undefined') {
      return (field === userSupplied);
    }
    const context = spec['@context'];
    const metaData = DataModelHelper.getMetaData(version);
    const matches = field.match(/^(([a-zA-Z]+):)?([a-zA-Z0-9]+)$/);
    if (matches !== null && typeof matches[1] !== 'undefined') {
      const prefix = matches[2];
      const unprefixedField = matches[3];
      let namespace = metaData.namespaces[prefix];
      if (typeof namespace === 'undefined') {
        if (field === userSupplied) {
          return true;
        }
        if (context[prefix] !== 'undefined') {
          namespace = context[prefix];
        }
      }
      if (`${namespace}${unprefixedField}` === userSupplied) {
        return true;
      }
      let localPrefix;
      for (const key in context) {
        if (Object.prototype.hasOwnProperty.call(context, key)) {
          if (context[key] === namespace) {
            localPrefix = key;
            if (`${key}:${unprefixedField}` === userSupplied) {
              return true;
            }
          } else if (
            typeof localPrefix !== 'undefined'
            && context[key] === `${localPrefix}:${unprefixedField}`
          ) {
            if (key === userSupplied) {
              return true;
            }
          } else if (context[key] === `${namespace}${unprefixedField}`) {
            if (key === userSupplied) {
              return true;
            }
          }
        }
      }
    } else if (field === userSupplied) {
      return true;
    }
    return false;
  }
};

module.exports = GraphHelper;
