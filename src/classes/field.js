const UriTemplate = require('uritemplate');
const DataModelHelper = require('../helpers/data-model');
const PropertyHelper = require('../helpers/property');

const Field = class {
  constructor(data = {}, version) {
    this.data = data;
    this.version = version;
  }

  get fieldName() {
    return this.data.fieldName;
  }

  get requiredType() {
    return this.data.requiredType;
  }

  get requiredContent() {
    return this.data.requiredContent;
  }

  get description() {
    return this.data.description;
  }

  get example() {
    return this.data.example;
  }

  get model() {
    return this.data.model;
  }

  get alternativeModels() {
    return this.data.alternativeModels || [];
  }

  get alternativeTypes() {
    return this.data.alternativeTypes || [];
  }

  get context() {
    return this.data.context;
  }

  get sameAs() {
    return this.data.sameAs;
  }

  get minDecimalPlaces() {
    return this.data.minDecimalPlaces;
  }

  get maxDecimalPlaces() {
    return this.data.maxDecimalPlaces;
  }

  get standard() {
    return this.data.standard;
  }

  get options() {
    return this.data.options;
  }

  getMappedValue(data) {
    return PropertyHelper.getObjectField(data, this.data.fieldName, this.version);
  }

  canBeArray() {
    const types = this.getAllPossibleTypes();
    for (const type of types) {
      if (type.match(/^ArrayOf#/)) {
        return true;
      }
    }
    return false;
  }

  getPossibleModels() {
    const models = [];
    if (typeof (this.model) !== 'undefined' && this.model !== null) {
      models.push(this.model);
    }
    return models.concat(this.alternativeModels);
  }

  detectType(data, inArray = false) {
    const possibleTypes = this.getAllPossibleTypes();
    let returnType;
    if (data === null) {
      return 'null';
    }
    if (typeof (data) === 'boolean') {
      return 'https://schema.org/Boolean';
    }
    if (typeof (data) === 'number') {
      returnType = 'https://schema.org/Float';
      if (
        /^-?[0-9]+([eE]-?[0-9]+)?$/.test(String(data))
                && data % 1 === 0
      ) {
        returnType = 'https://schema.org/Integer';
      }
      // If the type above isn't in the possible types, but Float is,
      // just cast as Float
      if (
        inArray
        && possibleTypes.indexOf(`ArrayOf#${returnType}`) < 0
        && possibleTypes.indexOf('ArrayOf#https://schema.org/Float') >= 0
      ) {
        returnType = 'https://schema.org/Float';
      } else if (
        !inArray
        && possibleTypes.indexOf(returnType) < 0
        && possibleTypes.indexOf('https://schema.org/Float') >= 0
      ) {
        returnType = 'https://schema.org/Float';
      }
      return returnType;
    }
    if (typeof (data) === 'string') {
      returnType = 'https://schema.org/Text';
      if (/^[0-9]{4}(-?)[0-9]{2}\1[0-9]{2}$/.test(data)) {
        returnType = 'https://schema.org/Date';
      } else if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(Z|[+-][0-9]{2}:[0-9]{2})?$/.test(data)) {
        returnType = 'https://schema.org/DateTime';
      } else if (/^[0-9]{2}:[0-9]{2}(:[0-9]{2})?(Z|[+-][0-9]{2}:[0-9]{2})?$/.test(data)) {
        returnType = 'https://schema.org/Time';
      } else if (/^P[.,0-9YMDHTMSW]+$/.test(data)) {
        returnType = 'https://schema.org/Duration';
      } else {
        // Do we have an enum in our possible types?
        let isEnum = false;
        for (const type of possibleTypes) {
          const allowedOptions = PropertyHelper.getEnumOptions(type, this.version);
          if (
            allowedOptions.length > 0
            && allowedOptions.indexOf(data) >= 0
          ) {
            isEnum = true;
            returnType = type;
            break;
          }
        }
        if (!isEnum) {
          // Is this a URL template?
          // This processes most strings... so could be a bit intensive
          const template = UriTemplate.parse(data);
          let isUrlTemplate = false;
          for (const expression of template.expressions) {
            if (expression.constructor.name === 'VariableExpression') {
              isUrlTemplate = true;
              break;
            }
          }
          if (isUrlTemplate) {
            returnType = 'https://schema.org/urlTemplate';
          } else if (this.constructor.URL_REGEX.test(data)) {
            returnType = 'https://schema.org/url';
          }
        }
      }
      // If the types above aren't in the possible types, but Text is,
      // just cast as Text
      if (
        inArray
        && possibleTypes.indexOf(`ArrayOf#${returnType}`) < 0
        && possibleTypes.indexOf('ArrayOf#https://schema.org/Text') >= 0
      ) {
        returnType = 'https://schema.org/Text';
      } else if (
        !inArray
        && possibleTypes.indexOf(returnType) < 0
        && possibleTypes.indexOf('https://schema.org/Text') >= 0
      ) {
        returnType = 'https://schema.org/Text';
      }
      return returnType;
    }
    if (typeof (data) === 'object') {
      if (data instanceof Array) {
        const types = [];
        for (const element of data) {
          types.push(this.detectType(element, true));
        }
        // Get unique version of array
        const uniqueTypes = [...new Set(types)];
        if (uniqueTypes.length === 1) {
          returnType = `ArrayOf#${uniqueTypes[0].replace(/^#/, '')}`;
        } else if (uniqueTypes.length > 1) {
          returnType = `ArrayOf#{${uniqueTypes.map(item => item.replace(/^#/, '')).join(',')}}`;
        } else {
          returnType = 'Array';
        }
        return returnType;
      }
      const dataType = PropertyHelper.getObjectField(data, '@type', this.version);
      if (typeof dataType !== 'undefined') {
        return `#${dataType}`;
      }
      return '#Thing';
    }
    if (typeof (data) === 'undefined') {
      return 'undefined';
    }
    return 'unknown';
  }

  detectedTypeIsAllowed(data) {
    const derivedType = this.detectType(data);
    const typeChecks = this.getAllPossibleTypes();
    let checkPass = false;
    for (const typeCheck of typeChecks) {
      if (this.canBeTypeOf(derivedType, typeCheck)) {
        checkPass = true;
        break;
      }
    }
    return checkPass;
  }

  getModelSubClassGraph(modelName) {
    let modelData = null;
    try {
      modelData = DataModelHelper.loadModel(modelName, this.version);
    } catch (e) {
      modelData = null;
    }
    if (!modelData) {
      return [];
    }
    return modelData.subClassGraph || [];
  }

  getAllPossibleTypes() {
    let typeChecks = [];
    if (typeof (this.requiredType) !== 'undefined') {
      typeChecks.push(this.requiredType);
    }
    if (typeof (this.alternativeTypes) !== 'undefined') {
      typeChecks = typeChecks.concat(this.alternativeTypes);
    }
    if (typeof (this.model) !== 'undefined') {
      typeChecks.push(this.model);
    }
    if (typeof (this.alternativeModels) !== 'undefined') {
      typeChecks = typeChecks.concat(this.alternativeModels);
    }
    return typeChecks;
  }

  isOnlyType(type) {
    return this.requiredType === type
            && !this.alternativeTypes.length
            && (typeof (this.model) === 'undefined' || this.model === null)
            && !this.alternativeModels.length;
  }

  canBeTypeOf(testType, actualType) {
    if (testType === null) {
      return false;
    }
    if (testType === actualType) {
      return true;
    }
    let testTypeKey = testType;
    let actualTypeKey = actualType;
    if (
      testTypeKey.substr(0, 8) === 'ArrayOf#'
      && actualTypeKey.substr(0, 8) === 'ArrayOf#'
    ) {
      testTypeKey = testTypeKey.substr(8);
      actualTypeKey = actualTypeKey.substr(8);
    } else if (
      testTypeKey.substr(0, 1) === '#'
      && actualTypeKey.substr(0, 1) === '#'
    ) {
      testTypeKey = testTypeKey.substr(1);
      actualTypeKey = actualTypeKey.substr(1);
    }
    if (
      typeof (this.constructor.canBeTypeOfMapping[testTypeKey]) !== 'undefined'
      && this.constructor.canBeTypeOfMapping[testTypeKey] === actualTypeKey
    ) {
      return true;
    }
    // Subclasses?
    if (testTypeKey.match(/^[A-Za-z:]+$/)) {
      const subClassGraph = this.getModelSubClassGraph(testTypeKey);
      if (subClassGraph.length) {
        const parentTestType = subClassGraph[0].substr(1);
        if (this.canBeTypeOf(parentTestType, actualTypeKey)) {
          return true;
        }
      }
    }
    // Check array types
    if (testTypeKey.match(/^{([A-Za-z:]+)(?:,([A-Za-z:]+))+}$/) && actualTypeKey.match(/^[A-Za-z:]+$/)) {
      const r = /(,?([A-Za-z:]+))/g;
      let match = r.exec(testTypeKey);
      while (match !== null) {
        const testMatch = this.canBeTypeOf(match[2], actualTypeKey);
        if (!testMatch) {
          return false;
        }
        match = r.exec(testTypeKey);
      }
      return true;
    }
    if (testTypeKey.match(/^[A-Za-z:]+$/) && actualTypeKey.match(/^[A-Za-z:]+$/)) {
      // If we have 2 models,
      // and this is being extended by a type we don't know, return true
      const prop = PropertyHelper.getFullyQualifiedProperty(testTypeKey, this.version);
      if (
        (typeof prop.prefix === 'undefined' || prop.prefix === null)
        && (typeof prop.namespace === 'undefined' || prop.namespace === null)
      ) {
        return true;
      }
    }
    return false;
  }
};

// Source: https://gist.github.com/dperini/729294
Field.URL_REGEX = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

Field.canBeTypeOfMapping = {
  'https://schema.org/Date': 'https://schema.org/Text',
  'https://schema.org/DateTime': 'https://schema.org/Text',
  'https://schema.org/Duration': 'https://schema.org/Text',
  'https://schema.org/Time': 'https://schema.org/Text',
  'https://schema.org/Integer': 'https://schema.org/Float',
  'https://schema.org/url': 'https://schema.org/Text',
  'https://schema.org/urlTemplate': 'https://schema.org/Text',
};

module.exports = Field;
