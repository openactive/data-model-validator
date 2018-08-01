const Rule = require('../rule');
const PropertyHelper = require('../../helpers/property');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ActivityInActivityListRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { Event: ['activity'] };
    this.meta = {
      name: 'ActivityInActivityListRule',
      description: 'Validates that an activity is in the Open Active activity list.',
      tests: {
        default: {
          message: 'Activity "{{activity}}" could not be found in the Open Active activity list.',
          sampleValues: {
            activity: 'Touch Football',
          },
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.ACTIVITY_NOT_IN_ACTIVITY_LIST,
        },
      },
    };
  }

  validateField(node, field) {
    if (typeof (node.value[field]) === 'undefined') {
      return [];
    }
    const errors = [];
    let found = false;
    let index = 0;
    if (node.value[field] instanceof Array) {
      for (const activity of node.value[field]) {
        found = false;
        let activityIdentifier;
        if (typeof activity === 'string' || typeof activity === 'object') {
          for (const activityList of node.options.activityLists) {
            if (typeof activityList.concepts !== 'undefined') {
              for (const concept of activityList.concepts) {
                if (typeof activity === 'string') {
                  activityIdentifier = activity;
                  if (concept.prefLabel.toLowerCase() === activity.toLowerCase()) {
                    found = true;
                    break;
                  }
                } else if (typeof activity === 'object') {
                  const prefLabel = PropertyHelper.getObjectField(activity, 'prefLabel');
                  const id = PropertyHelper.getObjectField(activity, 'id');
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
                  }
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
                path: `${node.getPath()}.${field}[${index}]`,
              },
              {
                activity: activityIdentifier,
              },
            ),
          );
        }
        index += 1;
      }
    }

    return errors;
  }
};
