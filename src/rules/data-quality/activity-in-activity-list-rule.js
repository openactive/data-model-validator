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
    this.targetFields = {
      Event: ['activity'],
      FacilityUse: ['activity'],
      IndividualFacilityUse: ['activity'],
      CourseInstance: ['activity'],
      EventSeries: ['activity'],
      HeadlineEvent: ['activity'],
      SessionSeries: ['activity'],
      Course: ['activity'],
    };
    this.meta = {
      name: 'ActivityInActivityListRule',
      description: 'Validates that an activity is in the OpenActive activity list.',
      tests: {
        default: {
          message: 'Activity `"{{activity}}"` could not be found in the OpenActive activity list.',
          sampleValues: {
            activity: 'Touch Football',
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.ACTIVITY_NOT_IN_ACTIVITY_LIST,
        },
        noPrefLabelMatch: {
          message: 'Activity `"{{activity}}"` was found in the activity list `"{{list}}"`, but the `"prefLabel"` did not match.\n\nThe correct `"prefLabel"` is `"{{correctPrefLabel}}"`.',
          sampleValues: {
            activity: 'https://openactive.io/activity-list#dc8b8b2b-0a83-403f-863a-4ec05ebb2410',
            correctPrefLabel: 'Touch Rugby Union',
            list: 'https://openactive.io/activity-list',
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.ACTIVITY_NOT_IN_ACTIVITY_LIST,
        },
        noIdMatch: {
          message: 'Activity `"{{activity}}"` was found in the activity list `"{{list}}"`, but the `"id"` did not match.\n\nThe correct `"id"` is `"{{correctId}}"`.',
          sampleValues: {
            activity: 'Touch Rugby Union',
            correctId: 'https://openactive.io/activity-list#dc8b8b2b-0a83-403f-863a-4ec05ebb2410',
            list: 'https://openactive.io/activity-list',
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.ACTIVITY_NOT_IN_ACTIVITY_LIST,
        },
        listErrorCode: {
          message: 'Activity list `"{{list}}"` did not return a valid HTTP status. The server returned an error {{code}}.',
          sampleValues: {
            list: 'https://openactive.io/activity-list/invalid-list.jsonld',
            code: 200,
          },
          category: ValidationErrorCategory.INTERNAL,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FILE_NOT_FOUND,
        },
        listInvalid: {
          message: 'Activity list `"{{list}}"` did not return a valid JSON response. Please check that it contains a JSON document in the format described in [the specification](https://www.openactive.io/modelling-opportunity-data/#describing-activity-lists-code-skos-conceptscheme-code-and-physical-activity-code-skos-concept-code-).',
          sampleValues: {
            list: 'https://openactive.io/activity-list',
          },
          category: ValidationErrorCategory.INTERNAL,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FILE_NOT_FOUND,
        },
        upgradeActivityList: {
          message: 'URL `"https://openactive.io/activity-list"` should now be used in the `"inScheme"` property to reference the OpenActive Activity list rather than `"{{list}}"`.',
          sampleValues: {
            list: 'https://www.openactive.io/activity-list/activity-list.jsonld',
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES,
        },
        useOfficialActivityList: {
          message: 'To ensure your data gets used by the largest number of apps and websites, it is recommended that you align your activities with the official [OpenActive activity list](https://openactive.io/activity-list).`',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.USE_OFFICIAL_ACTIVITY_LIST,
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
      'https://www.openactive.io/activity-list',
      'http://www.openactive.io/activity-list',
      'http://openactive.io/activity-list',
    ];
    const errors = [];
    let found = false;
    let idMatch = false;
    let prefLabelMatch = false;
    let correctId;
    let correctPrefLabel;
    let currentList;
    let index = 0;
    const metaData = DataModelHelper.getMetaData(node.options.version);
    if (fieldValue instanceof Array) {
      for (const activity of fieldValue) {
        if (typeof activity === 'object' && activity !== null) {
          found = false;
          let activityIdentifier;
          const inScheme = PropertyHelper.getObjectField(activity, 'inScheme', node.options.version);
          const activityLists = [];
          let listUrls = metaData.defaultActivityLists.slice();
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
              errors.push(
                this.createError(
                  'useOfficialActivityList',
                  {
                    value: activity,
                    path: node.getPath(field, index),
                  },
                ),
              );
            }
          } else {
            errors.push(
              this.createError(
                'useOfficialActivityList',
                {
                  value: activity,
                  path: node.getPath(field, index),
                },
              ),
            );
          }
          for (const listUrl of listUrls) {
            const jsonResponse = JsonLoaderHelper.getFile(listUrl, node.options);
            if (
              jsonResponse.errorCode === JsonLoaderHelper.ERROR_NONE
              && typeof jsonResponse.data === 'object'
              && jsonResponse.data !== null
            ) {
              activityLists.push(jsonResponse.data);
              if (typeof activityLists[activityLists.length - 1]['@url'] === 'undefined') {
                activityLists[activityLists.length - 1]['@url'] = listUrl;
              }
            } else if (
              jsonResponse.statusCode !== 200
              && jsonResponse.statusCode !== null
            ) {
              errors.push(
                this.createError(
                  'listErrorCode',
                  {
                    value: activity,
                    path: node.getPath(field, index),
                  },
                  {
                    list: listUrl,
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
                    list: listUrl,
                  },
                ),
              );
            }
          }
          for (const activityList of activityLists) {
            currentList = activityList['@url'];
            if (typeof activityList.concept !== 'undefined') {
              for (const concept of activityList.concept) {
                const prefLabel = PropertyHelper.getObjectField(activity, 'prefLabel', node.options.version);
                const id = PropertyHelper.getObjectField(activity, 'id', node.options.version);
                if (typeof prefLabel !== 'undefined') {
                  activityIdentifier = prefLabel;
                  prefLabelMatch = false;
                  correctPrefLabel = concept.prefLabel;
                  if (concept.prefLabel.toLowerCase() === prefLabel.toLowerCase()) {
                    found = true;
                    prefLabelMatch = true;
                  }
                } else {
                  prefLabelMatch = true;
                }
                if (typeof id !== 'undefined') {
                  if (typeof prefLabel === 'undefined' || !prefLabelMatch) {
                    activityIdentifier = id;
                  }
                  idMatch = false;
                  correctId = concept.id;
                  if (concept.id === id) {
                    found = true;
                    idMatch = true;
                  }
                } else {
                  idMatch = true;
                }
                if (found) {
                  break;
                }
              }
            }
          }
          let errorKey;
          let messageValues;
          if (!found) {
            errorKey = 'default';
            messageValues = {
              activity: activityIdentifier,
            };
          } else if (!prefLabelMatch) {
            errorKey = 'noPrefLabelMatch';
            messageValues = {
              activity: activityIdentifier,
              correctPrefLabel,
              list: currentList,
            };
          } else if (!idMatch) {
            errorKey = 'noIdMatch';
            messageValues = {
              activity: activityIdentifier,
              correctId,
              list: currentList,
            };
          }

          if (errorKey) {
            errors.push(
              this.createError(
                errorKey,
                {
                  value: activity,
                  path: node.getPath(field, index),
                },
                messageValues,
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
