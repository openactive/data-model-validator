const RawRule = require('../raw-rule');
const RawHelper = require('../../helpers/raw');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class RpdeFeedRule extends RawRule {
  constructor(options) {
    super(options);
    this.meta = {
      name: 'RpdeFeedRule',
      description: 'Adds notices if the JSON submission is detected to be an RPDE feed.',
      tests: {
        isRpdeFeed: {
          description: 'Adds a notice if the JSON submission is detected to be an RPDE feed.',
          message: 'The JSON you have submitted appears to be an RPDE feed. Please note that validation on RPDE feeds within the model validator is limited to checking whether required fields are present, and that the data in each item is a valid data model.',
          category: ValidationErrorCategory.INTERNAL,
          severity: ValidationErrorSeverity.NOTICE,
          type: ValidationErrorType.FOUND_RPDE_FEED,
        },
        isRpdeFeedWithLimit: {
          description: 'Adds a notice if the JSON submission is detected to be an RPDE feed, and there is a limit to the number of items that should be validated.',
          message: 'The JSON you have submitted appears to be an RPDE feed. For performance reasons, the validator has only checked the first {{limit}} items in this feed. Please note that validation on RPDE feeds within the model validator is limited to checking whether required fields are present, and that the data in each item is a valid data model.',
          sampleValues: {
            limit: 10,
          },
          category: ValidationErrorCategory.INTERNAL,
          severity: ValidationErrorSeverity.NOTICE,
          type: ValidationErrorType.FOUND_RPDE_FEED,
        },
      },
    };
  }

  validateRaw(data) {
    const errors = [];

    const dataCopy = data;
    let testKey;
    let messageValues;
    if (RawHelper.isRpdeFeed(dataCopy)) {
      testKey = 'isRpdeFeed';
      if (
        typeof this.options.rpdeItemLimit === 'number'
        && this.options.rpdeItemLimit > 0
      ) {
        // Let's restrict the number of things we actually process
        if (dataCopy.items.length > this.options.rpdeItemLimit) {
          let index = 0;
          for (const item of dataCopy.items) {
            if (item.state.toLowerCase() === 'updated') {
              index += 1;
              if (index === this.options.rpdeItemLimit) {
                testKey = 'isRpdeFeedWithLimit';
                messageValues = {
                  limit: this.options.rpdeItemLimit,
                };
                break;
              }
            }
          }
          if (testKey === 'isRpdeFeedWithLimit') {
            dataCopy.items = dataCopy.items.slice(0, index);
          }
        }
      }
    }
    if (testKey) {
      errors.push(
        this.createError(
          testKey,
          {
            value: dataCopy,
            path: '$',
          },
          messageValues,
        ),
      );
    }

    return {
      data: dataCopy,
      errors,
    };
  }
};
