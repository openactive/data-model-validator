const PropertyHelper = require('./property');

const GraphHelper = class {
  static getClassGraph(spec, classId, version, subClassSpecs) {
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
    const graphSpecs = [spec].concat(subClassSpecs);
    for (const graphSpec of graphSpecs) {
      if (typeof graphSpec['@graph'] !== 'undefined') {
        const context = this.mergeContexts(graphSpec['@context']);
        const graph = this.processGraph(graphSpec['@graph'], context, version);
        if (graph instanceof Array) {
          for (const item of graph) {
            classes = this.processClass(graphSpec, item, classId, version, subClassSpecs);
            if (classes.length > 0) {
              break;
            }
          }
        }
      } else {
        for (const itemKey in graphSpec) {
          if (Object.prototype.hasOwnProperty.call(graphSpec, itemKey)) {
            if (!itemKey.match(/^@/)) {
              const item = graphSpec[itemKey];
              classes = this.processClass(graphSpec, item, classId, version, subClassSpecs);
              if (classes.length > 0) {
                break;
              }
            }
          }
        }
      }
      if (classes.length > 0) {
        break;
      }
    }
    return classes;
  }

  static processClass(spec, item, classId, version, subClassSpecs) {
    let classes = [];
    const type = this.getProperty(spec, item, '@type', version);
    if (typeof type === 'string') {
      const id = this.getProperty(spec, item, '@id', version);
      const context = this.mergeContexts(spec['@context']);
      const classIdProp = PropertyHelper.getFullyQualifiedProperty(classId, version, { '@context': context });
      const idProp = PropertyHelper.getFullyQualifiedProperty(id, version, { '@context': context });
      const typeProp = PropertyHelper.getFullyQualifiedProperty(type, version, { '@context': context });
      if (
        typeProp.namespace === 'http://www.w3.org/2000/01/rdf-schema#'
        && typeProp.label === 'Class'
        && idProp.namespace !== null
        && idProp.label !== null
        && idProp.namespace === classIdProp.namespace
        && idProp.label === classIdProp.label
      ) {
        classes.push(`${classIdProp.namespace}${classIdProp.label}`);
        const subClassOf = this.getProperty(spec, item, 'http://www.w3.org/2000/01/rdf-schema#subClassOf', version);
        if (
          typeof subClassOf === 'object'
          && subClassOf !== null
        ) {
          const subClassId = this.getProperty(spec, subClassOf, '@id', version);
          if (typeof subClassId === 'string') {
            classes = classes.concat(this.getClassGraph(spec, subClassId, version, subClassSpecs));
          }
        } else if (typeof subClassOf === 'string') {
          classes = classes.concat(this.getClassGraph(spec, subClassOf, version, subClassSpecs));
        }
        if (typeof spec['@id'] !== 'undefined') {
          this.cache[spec['@id']][classId] = classes;
        }
      }
    }
    return classes;
  }

  static isPropertyInClass(spec, typeName, classId, version, subClassSpecs = []) {
    const classes = this.getClassGraph(spec, classId, version, subClassSpecs);
    if (typeof spec['@graph'] !== 'undefined') {
      const context = this.mergeContexts(spec['@context']);
      const graph = this.processGraph(spec['@graph'], context, version);
      if (graph instanceof Array) {
        for (const item of graph) {
          if (this.isProperty(spec, item, typeName, version)) {
            return this.processProperty(spec, item, classes, version);
          }
        }
      }
    } else {
      for (const itemKey in spec) {
        if (Object.prototype.hasOwnProperty.call(spec, itemKey)) {
          if (!itemKey.match(/^@/)) {
            const item = spec[itemKey];
            if (this.isProperty(spec, item, typeName, version)) {
              return this.processProperty(spec, item, classes, version);
            }
          }
        }
      }
    }
    return this.isPropertyInClassReturn(GraphHelper.PROPERTY_NOT_FOUND);
  }

  static isPropertyInClassReturn(code, data = null) {
    return {
      code,
      data,
    };
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
    const supersededBy = this.getProperty(spec, item, 'schema:supersededBy', version);

    let includes = this.getProperty(spec, item, 'schema:domainIncludes', version);
    if (typeof includes === 'undefined') {
      includes = this.getProperty(spec, item, 'rdfs:domain', version);
    }
    if (typeof includes !== 'undefined') {
      if (classes.length === 0) {
        return this.isPropertyInClassReturn(GraphHelper.PROPERTY_DOMAIN_NOT_FOUND);
      }
      if (!(includes instanceof Array)) {
        includes = [includes];
      }
      const returnIncludes = [];
      const context = this.mergeContexts(spec['@context']);
      for (const include of includes) {
        let includeId;
        if (
          typeof include === 'object'
          && include !== null
        ) {
          includeId = this.getProperty(spec, include, '@id', version);
        } else if (typeof include === 'string') {
          includeId = include;
        }
        if (typeof includeId === 'string') {
          const prop = PropertyHelper.getFullyQualifiedProperty(includeId, version, { '@context': context });
          if (prop.namespace) {
            returnIncludes.push(`${prop.namespace}${prop.label}`);
          } else if (prop.prefix) {
            returnIncludes.push(`${prop.prefix}:${prop.label}`);
          } else {
            returnIncludes.push(includeId);
          }
          for (const classItem of classes) {
            if (this.isPropertyEqual(spec, includeId, classItem, version)) {
              return this.isPropertyInClassReturn(GraphHelper.PROPERTY_FOUND, { supersededBy });
            }
          }
        }
      }
      if (returnIncludes.length > 0) {
        return this.isPropertyInClassReturn(GraphHelper.PROPERTY_NOT_IN_DOMAIN, returnIncludes);
      }
    }
    return this.isPropertyInClassReturn(GraphHelper.PROPERTY_FOUND, { supersededBy });
  }

  static processGraph(graph, context, version) {
    if (graph instanceof Array) {
      return graph;
    }
    let combinedGraph = [];
    if (
      typeof graph === 'object'
      && graph !== null
      && typeof graph['@context'] === 'object'
    ) {
      for (const prop in graph['@context']) {
        if (Object.prototype.hasOwnProperty.call(graph['@context'], prop)) {
          if (
            typeof graph['@context'][prop] === 'object'
            && typeof graph['@context'][prop]['@reverse'] !== 'undefined'
          ) {
            const qualifiedProp = PropertyHelper.getFullyQualifiedProperty(
              graph['@context'][prop]['@reverse'],
              version,
              { '@context': context },
            );
            if (
              qualifiedProp.namespace === 'http://www.w3.org/2000/01/rdf-schema#'
              && qualifiedProp.label === 'isDefinedBy'
              && typeof graph[prop] === 'object'
              && graph[prop] instanceof Array
            ) {
              combinedGraph = combinedGraph.concat(graph[prop]);
            }
          }
        }
      }
    }

    return combinedGraph;
  }

  static mergeContexts(contexts = []) {
    // Merge the contexts into a flat structure
    let mergedContext = {};
    if (contexts instanceof Array) {
      for (const context of contexts) {
        // If this is not an object, we can't process it
        if (typeof context === 'object' && context !== null) {
          mergedContext = Object.assign(mergedContext, context);
        }
      }
    } else if (typeof contexts === 'object' && contexts !== null) {
      mergedContext = Object.assign(mergedContext, contexts);
    }
    return mergedContext;
  }

  static getProperty(spec, item, field, version) {
    if (typeof item[field] !== 'undefined') {
      return item[field];
    }
    if (typeof spec['@context'] === 'undefined') {
      return undefined;
    }
    const context = this.mergeContexts(spec['@context']);
    const prop = PropertyHelper.getFullyQualifiedProperty(field, version, { '@context': context });
    if (
      typeof prop.alias !== 'undefined'
      && prop.alias !== null
      && typeof item[prop.alias] !== 'undefined'
    ) {
      return item[prop.alias];
    }
    if (
      prop.prefix !== null
      && typeof item[`${prop.prefix}:${prop.label}`] !== 'undefined'
    ) {
      return item[`${prop.prefix}:${prop.label}`];
    }
    if (
      prop.namespace !== null
      && typeof item[`${prop.namespace}${prop.label}`] !== 'undefined'
    ) {
      return item[`${prop.namespace}${prop.label}`];
    }
    return undefined;
  }

  static isPropertyEqual(spec, userSupplied, field, version) {
    if (typeof spec['@context'] === 'undefined') {
      return (field === userSupplied);
    }
    const context = this.mergeContexts(spec['@context']);
    const prop = PropertyHelper.getFullyQualifiedProperty(field, version, { '@context': context });
    if (
      typeof prop.alias !== 'undefined'
      && prop.alias !== null
      && prop.alias === userSupplied
    ) {
      return true;
    }
    if (
      prop.prefix !== null
      && `${prop.prefix}:${prop.label}` === userSupplied
    ) {
      return true;
    }
    if (
      prop.namespace !== null
      && `${prop.namespace}${prop.label}` === userSupplied
    ) {
      return true;
    }
    return false;
  }
};

GraphHelper.PROPERTY_FOUND = 1;
GraphHelper.PROPERTY_NOT_FOUND = 2;
GraphHelper.PROPERTY_NOT_IN_DOMAIN = 3;
GraphHelper.PROPERTY_DOMAIN_NOT_FOUND = 4;

module.exports = GraphHelper;
