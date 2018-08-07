const GraphHelper = class {
  static getClassGraph(spec, classId) {
    if (typeof this.cache === 'undefined') {
      this.cache = {};
    }
    if (typeof this.cache[spec['@id']] === 'undefined') {
      this.cache[spec['@id']] = {};
    }
    if (typeof this.cache[spec['@id']][classId] !== 'undefined') {
      return this.cache[spec['@id']][classId];
    }
    let classes = [];
    if (typeof spec['@graph'] !== 'undefined') {
      for (const item of spec['@graph']) {
        if (
          item['@type'] === 'rdfs:Class'
          && item['@id'] === classId
        ) {
          classes.push(classId);
          if (
            typeof item['rdfs:subClassOf'] === 'object'
            && item['rdfs:subClassOf'] !== null
            && typeof item['rdfs:subClassOf']['@id'] === 'string'
          ) {
            classes = classes.concat(this.getClassGraph(spec, item['rdfs:subClassOf']['@id']));
          }
          this.cache[classId] = classes;
        }
      }
    }
    return classes;
  }

  static isPropertyInClass(spec, typeName, classId) {
    const classes = this.getClassGraph(spec, classId);
    if (classes.length > 0 && typeof spec['@graph'] !== 'undefined') {
      for (const item of spec['@graph']) {
        if (
          item['@type'] === 'rdf:Property'
          && item['rdfs:label'] === typeName
          && typeof item['http://schema.org/domainIncludes'] !== 'undefined'
        ) {
          let includes = item['http://schema.org/domainIncludes'];
          if (!(includes instanceof Array)) {
            includes = [includes];
          }
          for (const include of includes) {
            if (
              typeof include['@id'] === 'string'
              && classes.indexOf(include['@id']) >= 0
            ) {
              return true;
            }
          }
        }
      }
    }
    return false;
  }
};

module.exports = GraphHelper;
