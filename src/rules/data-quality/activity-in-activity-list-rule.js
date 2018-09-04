const DataModelHelper = require('../../helpers/data-model');
const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const JsonLoaderHelper = require('../../helpers/json-loader');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ActivityInActivityListRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { Event: ['activity'] };
    this.meta = {
      name: 'ActivityInActivityListRule',
      description: 'Validates that an activity is in the OpenActive activity list.',
      tests: {
        default: {
          message: 'Activity "{{activity}}" could not be found in the OpenActive activity list.',
          sampleValues: {
            activity: 'Touch Football',
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.ACTIVITY_NOT_IN_ACTIVITY_LIST,
        },
        listErrorCode: {
          message: 'Activity list "{{list}}" did not return a valid HTTP status. The server returned an error {{code}}.',
          sampleValues: {
            list: 'https://openactive.io/activity-list/invalid-list.jsonld',
            code: 200,
          },
          category: ValidationErrorCategory.INTERNAL,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FILE_NOT_FOUND,
        },
        listInvalid: {
          message: 'Activity list "{{list}}" did not return a valid JSON response. Please check that it contains a JSON document in the format described in [the specification](https://www.openactive.io/modelling-opportunity-data/#describing-activity-lists-code-skos-conceptscheme-code-and-physical-activity-code-skos-concept-code-).',
          sampleValues: {
            list: 'https://openactive.io/activity-list',
          },
          category: ValidationErrorCategory.INTERNAL,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FILE_NOT_FOUND,
        },
        upgradeActivityList: {
          message: 'URL "https://openactive.io/activity-list" should now be used in the "inScheme" property to reference the OpenActive Activity list rather than "{{list}}".',
          sampleValues: {
            list: 'https://www.openactive.io/activity-list/activity-list.jsonld',
          },
          category: ValidationErrorCategory.INTERNAL,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES,
        },
      },
    };
  }

  validateField(node, field) {
    const fieldValue = node.getValue(field);
    if (typeof fieldValue === 'undefined') {
      return [];
    }
    const upgradeActivityLists = [
      'https://www.openactive.io/activity-list/activity-list.jsonld',
      'https://openactive.io/activity-list/activity-list.jsonld',
      'http://www.openactive.io/activity-list/activity-list.jsonld',
      'http://openactive.io/activity-list/activity-list.jsonld',
      'https://www.openactive.io/activity-list/',
      'https://openactive.io/activity-list/',
      'http://www.openactive.io/activity-list/',
      'http://openactive.io/activity-list/',
    ];
    const errors = [];
    let found = false;
    let index = 0;
    const metaData = DataModelHelper.getMetaData(node.options.version);
    if (fieldValue instanceof Array) {
      for (const activity of fieldValue) {
        if (typeof activity === 'object' && activity !== null) {
          found = false;
          let activityIdentifier;
          const inScheme = PropertyHelper.getObjectField(activity, 'inScheme', node.options.version);
          const activityLists = [];
          let listUrls = metaData.defaultActivityLists;
          if (typeof inScheme !== 'undefined') {
            if (upgradeActivityLists.indexOf(inScheme) >= 0) {
              errors.push(
                this.createError(
                  'upgradeActivityList',
                  {
                    value: activity,
                    path: node.getPath(field, index),
                  },
                  {
                    list: inScheme,
                  },
                ),
              );
            } else if (metaData.defaultActivityLists.indexOf(inScheme) < 0) {
              listUrls = [inScheme];
            }
          }
          for (const listUrl of listUrls) {
            const jsonResponse = JsonLoaderHelper.getFile(listUrl, node.options);
            if (
              jsonResponse.errorCode === JsonLoaderHelper.ERROR_NONE
              && typeof jsonResponse.data === 'object'
              && jsonResponse.data !== null
            ) {
              activityLists.push(jsonResponse.data);
            } else if (jsonResponse.statusCode !== 200) {
              errors.push(
                this.createError(
                  'listErrorCode',
                  {
                    value: activity,
                    path: node.getPath(field, index),
                  },
                  {
                    list: inScheme,
                    code: jsonResponse.statusCode,
                  },
                ),
              );
            } else {
              errors.push(
                this.createError(
                  'listInvalid',
                  {
                    value: activity,
                    path: node.getPath(field, index),
                  },
                  {
                    list: inScheme,
                  },
                ),
              );
            }
          }
          for (const activityList of activityLists) {
            if (typeof activityList.concepts !== 'undefined') {
              for (const concept of activityList.concepts) {
                const prefLabel = PropertyHelper.getObjectField(activity, 'prefLabel', node.options.version);
                const notation = PropertyHelper.getObjectField(activity, 'notation', node.options.version);
                const id = PropertyHelper.getObjectField(activity, 'id', node.options.version);
                if (typeof prefLabel !== 'undefined') {
                  activityIdentifier = prefLabel;
                  if (concept.prefLabel.toLowerCase() === prefLabel.toLowerCase()) {
                    found = true;
                    break;
                  }
                } else if (typeof id !== 'undefined') {
                  activityIdentifier = id;
                  if (concept.id === id) {
                    found = true;
                    break;
                  }
                } else if (typeof notation !== 'undefined') {
                  activityIdentifier = notation;
                  if (concept.notation === notation) {
                    found = true;
                    break;
                  }
                }
              }
            }
          }
          if (!found) {
            errors.push(
              this.createError(
                'default',
                {
                  value: activity,
                  path: node.getPath(field, index),
                },
                {
                  activity: activityIdentifier,
                },
              ),
            );
          }
        }
        index += 1;
      }
    }

    return errors;
  }
};
