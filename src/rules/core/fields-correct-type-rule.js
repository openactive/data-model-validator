const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
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
          message: 'Invalid type, expected {{expectedType}}{{idReferencingMessage}} but found {{foundType}}.{{examples}}',
          sampleValues: {
            expectedType: this.constructor.getHumanReadableType('https://schema.org/Text'),
            foundType: this.constructor.getHumanReadableType('https://schema.org/Number'),
            examples: this.constructor.makeExamples('property', ['https://schema.org/Text'], this.options.version, true),
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_TYPE,
        },
        singleTypeSubclassSingleError: {
          description: 'Validates that a property conforms to a single type.',
          message: 'Invalid type, found {{foundType}}, which is not allowed in {{expectedType}}.{{examples}}',
          sampleValues: {
            expectedType: this.constructor.getHumanReadableType('LocationFeatureSpecification'),
            foundType: this.constructor.getHumanReadableType('ChangingRooms'),
            examples: this.constructor.makeExamples('property', ['LocationFeatureSpecification'], this.options.version, true),
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_TYPE,
        },
        singleTypeSubclassMultipleError: {
          description: 'Validates that a property conforms to a single type.',
          message: 'Invalid type, found {{foundTypes}} which are not allowed in {{expectedType}}.{{examples}}',
          sampleValues: {
            expectedType: this.constructor.getHumanReadableType('LocationFeatureSpecification'),
            foundTypes: this.constructor.makeExpectedTypeList(['ChangingRooms', 'GolfCourse']),
            examples: this.constructor.makeExamples('property', ['LocationFeatureSpecification'], this.options.version, true),
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_TYPE,
        },
        multipleTypes: {
          description: 'Validates that a property conforms one of a list of types.',
          message: 'Invalid type, expected one of {{expectedTypes}}{{idReferencingMessage}} but found {{foundType}}.{{examples}}',
          sampleValues: {
            expectedTypes: this.constructor.makeExpectedTypeList(['https://schema.org/Text', 'ArrayOf#https://schema.org/Text', '#Concept', 'ArrayOf#Concept']),
            foundType: this.constructor.getHumanReadableType('https://schema.org/Number'),
            examples: this.constructor.makeExamples('property', ['https://schema.org/Text', 'ArrayOf#https://schema.org/Text', '#Concept', 'ArrayOf#Concept'], this.options.version, true),
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
      case 'https://schema.org/Number':
        return `[\`decimal${plural}\`](${type})`;
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
      case 'https://schema.org/Property':
        return `[\`string${plural}\` containing the URL of a property](${type}) from the [OpenActive](https://openactive.io/ns) or [schema.org](https://schema.org/) vocabularies`;
      case 'https://schema.org/URL':
        return `[\`string${plural}\` containing a url](${type})`;
      case 'https://openactive.io/IdReference':
        return '[`@id` reference](https://permalink.openactive.io/data-model-validator/id-references)';
      default:
        return `\`${type.replace(/^#/, '')}\``;
    }
  }

  static getHumanReadableExample(property, type, version) {
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
    if (isArray || humanReadableType.match(/^\[?`[aeiouAEIOU@]/)) {
      aOrAn = 'An';
    }
    const hint = `${aOrAn} ${isArray ? 'array of ' : ''}${humanReadableType} looks like this:`;

    let example = '';
    switch (readableType) {
      case 'https://schema.org/Text':
        example = `${prefix}"example string"`;
        break;
      case 'https://schema.org/Number':
        example = `${prefix}1.234`;
        break;
      case 'https://schema.org/Boolean':
        example = `${prefix}true`;
        break;
      case 'https://schema.org/Integer':
        example = `${prefix}1234`;
        break;
      case 'https://schema.org/Date':
        example = `${prefix}"2017-03-04"`;
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
      case 'https://schema.org/Property':
        example = `${prefix}"https://schema.org/givenName"`;
        break;
      case 'https://schema.org/URL':
        example = `${prefix}"https://www.example.org/"`;
        break;
      case 'https://openactive.io/IdReference':
        example = `${prefix}"https://id.example.com/api/session-series/1402CBP20150217"`;
        break;
      default:
        if (PropertyHelper.isEnum(readableType, version)) {
          const allowedOptions = PropertyHelper.getEnumOptions(readableType, version);
          example = `${prefix}"${allowedOptions[0]}"`;
        } else {
          example = `${prefix}{\n${prefix}  "@type": "${readableType.replace(/^#/, '')}"\n${prefix}}`;
        }
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

  static makeExamples(property, types, version, renderedExample, allowReferencing) {
    let examples = '';
    for (const type of types) {
      examples = `${examples}\n\n${this.getHumanReadableExample(property, type, version)}`;
    }
    if (renderedExample) {
      const hint = types.length > 1 ? 'A full example of the preferred approach looks like this:' : 'A full example looks like this:';
      examples = `${examples}\n\n${hint}\n\n${renderedExample}`;
    }
    if (allowReferencing) examples = `${examples}\n\nA URI reference which matches the \`@id\` of an object defined elsewhere may be used in place of the object itself. ${this.getHumanReadableExample(property, 'https://openactive.io/IdReference', version)}`;
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
    const fieldValue = node.getValue(field);
    const derivedType = fieldObj.detectType(fieldValue);

    const typeChecks = fieldObj.getAllPossibleTypes();

    // TODO: Should this throw an error..?
    if (typeChecks.length === 0) {
      return [];
    }

    // Ignore - this will be picked up by ValueInOptionsRule
    let testType;
    if (typeChecks.length === 1) {
      [testType] = typeChecks;
    } else {
      testType = fieldObj.detectType(fieldValue);
    }
    if (fieldValue instanceof Array && fieldObj.canBeArray()) {
      testType = testType.replace(/^ArrayOf#/, '');
    }
    if (
      typeof testType !== 'undefined'
      && PropertyHelper.isEnum(testType, node.options.version)
    ) {
      return [];
    }

    const checkPass = fieldObj.detectedTypeIsAllowed(fieldValue)
      // Pass check if referencing via a URL that matches an @id elsewhere is allowed, and in use
      || (fieldObj.allowReferencing && typeof fieldValue === 'string' && PropertyHelper.isUrl(fieldValue));

    if (!checkPass) {
      // Hide this error if a more relevant error is being displayed
      const isReferencedField = fieldObj.allowReferencing && node.model.getReferencedFields(node.options.validationMode, node.name).includes(field);
      const isShouldNotBeReferencedField = fieldObj.allowReferencing && node.model.getShallNotBeReferencedFields(node.options.validationMode, node.name).includes(field);
      if (isReferencedField || (isShouldNotBeReferencedField && typeof fieldValue === 'string')) {
        return [];
      }

      const idReferencingMessage = fieldObj.allowReferencing && !isShouldNotBeReferencedField ? ' or a reference URI to an `@id`' : '';
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
        let noArrayDerivedType = derivedType;
        let noArrayTypeCheck = typeChecks[0];
        if (derivedType.match(/^ArrayOf#/) && typeChecks[0].match(/^ArrayOf#/)) {
          noArrayDerivedType = derivedType.replace(/^ArrayOf#/, '');
          noArrayTypeCheck = typeChecks[0].replace(/^ArrayOf#/, '');
        }
        if (noArrayDerivedType.match(/^{([A-Za-z:]+)(?:,([A-Za-z:]+))+}$/)) {
          const r = /(,?([A-Za-z:]+))/g;
          let match = r.exec(noArrayDerivedType);
          const notAllowed = [];
          while (match !== null) {
            const testMatch = fieldObj.canBeTypeOf(match[2], noArrayTypeCheck);
            if (!testMatch) {
              notAllowed.push(match[2]);
            }
            match = r.exec(noArrayDerivedType);
          }
          if (notAllowed.length === 1) {
            testKey = 'singleTypeSubclassSingleError';
            messageValues = {
              expectedType: this.constructor.getHumanReadableType(typeChecks[0]),
              foundType: this.constructor.getHumanReadableType(notAllowed[0]),
              examples: this.constructor.makeExamples(propName, typeChecks, node.options.version, fieldObj.getRenderedExample(), fieldObj.allowReferencing && !isShouldNotBeReferencedField),
            };
          } else if (notAllowed.length > 1) {
            testKey = 'singleTypeSubclassMultipleError';
            messageValues = {
              expectedType: this.constructor.getHumanReadableType(typeChecks[0]),
              foundTypes: this.constructor.makeExpectedTypeList(notAllowed),
              examples: this.constructor.makeExamples(propName, typeChecks, node.options.version, fieldObj.getRenderedExample(), fieldObj.allowReferencing && !isShouldNotBeReferencedField),
            };
          }
        } else {
          testKey = 'singleType';
          messageValues = {
            expectedType: this.constructor.getHumanReadableType(typeChecks[0]),
            foundType: this.constructor.getHumanReadableType(derivedType),
            examples: this.constructor.makeExamples(propName, typeChecks, node.options.version, fieldObj.getRenderedExample(), fieldObj.allowReferencing && !isShouldNotBeReferencedField),
            idReferencingMessage,
          };
        }
      } else {
        testKey = 'multipleTypes';
        const expectedTypes = this.constructor.makeExpectedTypeList(typeChecks);
        messageValues = {
          expectedTypes,
          foundType: this.constructor.getHumanReadableType(derivedType),
          examples: this.constructor.makeExamples(propName, typeChecks, node.options.version, fieldObj.getRenderedExample(), fieldObj.allowReferencing && !isShouldNotBeReferencedField),
          idReferencingMessage,
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
