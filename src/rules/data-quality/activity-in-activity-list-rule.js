const fs = require('fs');
const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ActivityInActivityListRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = { Event: ['activity'] };
    this.description = 'Validates that an activity is in the OpenActive activity list.';
  }

  validateField(node, field) {
    if (typeof (node.value[field]) === 'undefined') {
      return [];
    }
    const errors = [];
    let activityList;
    try {
      activityList = JSON.parse(
        fs.readFileSync(
          require.resolve('openactive-activity-list/activity-list.jsonld'),
        ),
      );
    } catch (e) {
      errors.push(
        new ValidationError(
          {
            category: ValidationErrorCategory.INTERNAL,
            type: ValidationErrorType.FILE_NOT_FOUND,
            message: 'Could not check activities are in activity list - could not find activity list file',
            value: node.value[field],
            severity: ValidationErrorSeverity.WARNING,
            path: `${node.getPath()}.${field}`,
          },
        ),
      );
      return errors;
    }

    let found = false;
    let index = 0;
    if (node.value[field] instanceof Array) {
      for (const activity of node.value[field]) {
        found = false;
        if (typeof activity === 'string' || typeof activity === 'object') {
          for (const concept of activityList.concepts) {
            if (typeof activity === 'string') {
              if (concept.prefLabel.toLowerCase() === activity.toLowerCase()) {
                found = true;
                break;
              }
            } else if (typeof activity === 'object') {
              if (typeof activity.prefLabel !== 'undefined') {
                if (concept.prefLabel.toLowerCase() === activity.prefLabel.toLowerCase()) {
                  found = true;
                  break;
                }
              } else if (typeof activity.id !== 'undefined') {
                if (concept.id === activity.id) {
                  found = true;
                  break;
                }
              }
            }
          }
        }
        if (!found) {
          errors.push(
            new ValidationError(
              {
                category: ValidationErrorCategory.DATA_QUALITY,
                type: ValidationErrorType.ACTIVITY_NOT_IN_ACTIVITY_LIST,
                value: activity,
                severity: ValidationErrorSeverity.WARNING,
                path: `${node.getPath()}.${field}[${index}]`,
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
