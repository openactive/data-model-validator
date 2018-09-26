const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class FieldsCorrectTypeRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = '*';
    this.meta = {
      name: 'FieldsCorrectTypeRule',
      description: 'Validates that all properties are the correct type.',
      tests: {
        noValueObjects: {
          description: 'Raises a notice if a JSON-LD value object is found.',
          message: 'Whilst value objects are valid JSON-LD, they are not part of the OpenActive specification. Please use a JavaScript primitive type instead.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.UNSUPPORTED_VALUE,
        },
        singleType: {
          description: 'Validates that a property conforms to a single type.',
          message: 'Invalid type, expected {{expectedType}} but found {{foundType}}.{{examples}}',
          sampleValues: {
            expectedType: this.constructor.getHumanReadableType('https://schema.org/Text'),
            foundType: this.constructor.getHumanReadableType('https://schema.org/Float'),
            examples: this.constructor.makeExamples('property', ['https://schema.org/Text']),
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_TYPE,
        },
        multipleTypes: {
          description: 'Validates that a property conforms one of a list of types.',
          message: 'Invalid type, expected one of {{expectedTypes}} but found {{foundType}}.{{examples}}',
          sampleValues: {
            expectedTypes: this.constructor.makeExpectedTypeList(['https://schema.org/Text', 'ArrayOf#https://schema.org/Text', '#Concept', 'ArrayOf#Concept']),
            foundType: this.constructor.getHumanReadableType('https://schema.org/Float'),
            examples: this.constructor.makeExamples('property', ['https://schema.org/Text', 'ArrayOf#https://schema.org/Text', '#Concept', 'ArrayOf#Concept']),
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_TYPE,
        },
      },
    };
  }

  static getHumanReadableType(type) {
    let ret = '';
    let isArray = false;
    let readableType = type;
    if (type.match(/^ArrayOf#/)) {
      ret = '`Array` of ';
      readableType = readableType.replace(/^ArrayOf#/, '');
      isArray = true;
    }
    return `${ret}${this.getHumanReadableRawType(readableType, isArray)}`;
  }

  static getHumanReadableRawType(type, isArray = false) {
    let plural = '';
    if (isArray) {
      plural = 's';
    }
    switch (type) {
      case 'https://schema.org/Text':
        return `[\`string${plural}\`](${type})`;
      case 'https://schema.org/Float':
        return `[\`float${plural}\`](${type})`;
      case 'https://schema.org/Boolean':
        return `[\`boolean${plural}\`](${type})`;
      case 'https://schema.org/Integer':
        return `[\`integer${plural}\`](${type})`;
      case 'https://schema.org/Date':
        return `[\`string${plural}\` containing an ISO 8601 Date](${type})`;
      case 'https://schema.org/DateTime':
        return `[\`string${plural}\` containing an ISO 8601 DateTime](${type})`;
      case 'https://schema.org/Time':
        return `[\`string${plural}\` containing an ISO 8601 Time](${type})`;
      case 'https://schema.org/Duration':
        return `[\`string${plural}\` containing an ISO 8601 Duration](${type})`;
      case 'https://schema.org/url':
        return `[\`string${plural}\` containing a url](${type})`;
      case 'https://schema.org/urlTemplate':
        return `[\`string${plural}\` containing a urlTemplate](${type})`;
      default:
        return `\`${type.replace(/^#/, '')}\``;
    }
  }

  static getHumanReadableExample(property, type) {
    let isArray = false;
    let prefix = '';
    let readableType = type;
    if (type.match(/^ArrayOf#/)) {
      readableType = readableType.replace(/^ArrayOf#/, '');
      isArray = true;
      prefix = '  ';
    }
    const humanReadableType = this.getHumanReadableRawType(readableType, isArray);
    let aOrAn = 'A';
    if (isArray || humanReadableType.match(/^\[?`[aeiouAEIOU]/)) {
      aOrAn = 'An';
    }
    const hint = `${aOrAn} ${isArray ? 'array of ' : ''}${humanReadableType} looks like this:`;

    let example = '';
    switch (readableType) {
      case 'https://schema.org/Text':
        example = `${prefix}"example string"`;
        break;
      case 'https://schema.org/Float':
        example = `${prefix}1.234`;
        break;
      case 'https://schema.org/Boolean':
        example = `${prefix}true`;
        break;
      case 'https://schema.org/Integer':
        example = `${prefix}1234`;
        break;
      case 'https://schema.org/Date':
        example = `${prefix}"2017-03-04Z"`;
        break;
      case 'https://schema.org/DateTime':
        example = `${prefix}"2017-03-04T20:15:00Z"`;
        break;
      case 'https://schema.org/Time':
        example = `${prefix}"20:15"`;
        break;
      case 'https://schema.org/Duration':
        example = `${prefix}"PT30M"`;
        break;
      case 'https://schema.org/url':
        example = `${prefix}"https://www.example.org/"`;
        break;
      case 'https://schema.org/urlTemplate':
        example = `${prefix}"https://www.example.org/{startDate}/{endDate}"`;
        break;
      default:
        example = `${prefix}{\n${prefix}  "type": "${readableType.replace(/^#/, '')}"\n${prefix}}`;
        break;
    }
    if (isArray) {
      return `${hint}\n\n\`\`\`\n${property ? `"${property}": ` : ''}[\n${example}\n]\n\`\`\``;
    }
    return `${hint}\n\n\`\`\`\n${property ? `"${property}": ` : ''}${example}\n\`\`\``;
  }

  static makeExpectedTypeList(typeChecks) {
    let expectedTypes = '\n\n<ul>';
    for (const typeCheck of typeChecks) {
      expectedTypes = `${expectedTypes}<li>${this.getHumanReadableType(typeCheck)}</li>`;
    }
    return `${expectedTypes}</ul>`;
  }

  static makeExamples(property, types) {
    let examples = '';
    for (const type of types) {
      examples = `${examples}\n\n${this.getHumanReadableExample(property, type)}`;
    }
    return examples;
  }

  validateField(node, field) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification || !node.model.isJsonLd) {
      return [];
    }
    const fieldObj = node.model.getField(field);
    if (typeof fieldObj === 'undefined') {
      return [];
    }

    const errors = [];

    // Get the derived type
    const fieldValue = node.getMappedValue(field);
    const derivedType = fieldObj.detectType(fieldValue);

    const typeChecks = fieldObj.getAllPossibleTypes();

    // TODO: Should this throw an error..?
    if (typeChecks.length === 0) {
      return [];
    }

    const checkPass = fieldObj.detectedTypeIsAllowed(fieldValue);

    if (!checkPass) {
      let testKey;
      let messageValues = {};
      let propName = field;
      if (propName === '$' || !propName) {
        propName = null;
      }
      // Check whether we have a value object
      if (
        typeof fieldValue === 'object'
        && fieldValue !== null
        && typeof fieldValue.type === 'undefined'
        && typeof fieldValue['@type'] === 'undefined'
        && typeof fieldValue['@value'] !== 'undefined'
      ) {
        testKey = 'noValueObjects';
      } else if (typeChecks.length === 1) {
        testKey = 'singleType';
        messageValues = {
          expectedType: this.constructor.getHumanReadableType(typeChecks[0]),
          foundType: this.constructor.getHumanReadableType(derivedType),
          examples: this.constructor.makeExamples(propName, typeChecks),
        };
      } else {
        testKey = 'multipleTypes';
        const expectedTypes = this.constructor.makeExpectedTypeList(typeChecks);
        messageValues = {
          expectedTypes,
          foundType: this.constructor.getHumanReadableType(derivedType),
          examples: this.constructor.makeExamples(propName, typeChecks),
        };
      }
      errors.push(
        this.createError(
          testKey,
          {
            value: fieldValue,
            path: node.getPath(field),
          },
          messageValues,
        ),
      );
    }

    return errors;
  }
};
