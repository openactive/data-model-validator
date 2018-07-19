

const Field = class {
  constructor(data = {}) {
    this.data = data;
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

  get standard() {
    return this.data.standard;
  }

  get options() {
    return this.data.options;
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
      return 'http://schema.org/Boolean';
    }
    if (typeof (data) === 'number') {
      returnType = 'http://schema.org/Float';
      if (
        /^-?[0-9]+([eE]-?[0-9]+)?$/.test(String(data))
                && data % 1 === 0
      ) {
        returnType = 'http://schema.org/Integer';
      }
      // If the type above isn't in the possible types, but Float is,
      // just cast as Float
      if (
        inArray
                && possibleTypes.indexOf(`ArrayOf#${returnType}`) < 0
                && possibleTypes.indexOf('ArrayOf#http://schema.org/Float') >= 0
      ) {
        returnType = 'http://schema.org/Float';
      } else if (
        !inArray
                && possibleTypes.indexOf(returnType) < 0
                && possibleTypes.indexOf('http://schema.org/Float') >= 0
      ) {
        returnType = 'http://schema.org/Float';
      }
      return returnType;
    }
    if (typeof (data) === 'string') {
      returnType = 'http://schema.org/Text';
      if (this.constructor.URL_REGEX.test(data)) {
        returnType = 'http://schema.org/url';
      } else if (/^[0-9]{4}(-?)[0-9]{2}\1[0-9]{2}$/.test(data)) {
        returnType = 'http://schema.org/Date';
      } else if (/^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}(Z|[+-][0-9]{2}:[0-9]{2})?$/.test(data)) {
        returnType = 'http://schema.org/DateTime';
      } else if (/^[0-9]{2}:[0-9]{2}(:[0-9]{2})?(Z|[+-][0-9]{2}:[0-9]{2})?$/.test(data)) {
        returnType = 'http://schema.org/Time';
      } else if (/^P[.,0-9YMDHTMSW]+$/.test(data)) {
        returnType = 'http://schema.org/Duration';
      }
      // If the types above aren't in the possible types, but Text is,
      // just cast as Text
      if (
        inArray
                && possibleTypes.indexOf(`ArrayOf#${returnType}`) < 0
                && possibleTypes.indexOf('ArrayOf#http://schema.org/Text') >= 0
      ) {
        returnType = 'http://schema.org/Text';
      } else if (
        !inArray
                && possibleTypes.indexOf(returnType) < 0
                && possibleTypes.indexOf('http://schema.org/Text') >= 0
      ) {
        returnType = 'http://schema.org/Text';
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
      if (typeof (data.type) !== 'undefined') {
        return `#${data.type}`;
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
    }
    if (typeof (this.constructor.canBeTypeOfMapping[testTypeKey]) !== 'undefined'
            && this.constructor.canBeTypeOfMapping[testTypeKey] === actualTypeKey
    ) {
      return true;
    }
    return false;
  }
};

// Source: https://gist.github.com/dperini/729294
Field.URL_REGEX = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;

Field.canBeTypeOfMapping = {
  'http://schema.org/Date': 'http://schema.org/Text',
  'http://schema.org/DateTime': 'http://schema.org/Text',
  'http://schema.org/Duration': 'http://schema.org/Text',
  'http://schema.org/Time': 'http://schema.org/Text',
  'http://schema.org/Integer': 'http://schema.org/Float',
  'http://schema.org/url': 'http://schema.org/Text',
};

module.exports = Field;
