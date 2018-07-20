

const ValidationErrorType = require('./validation-error-type');

const ValidationErrorMessage = {
  [ValidationErrorType.INVALID_JSON]: 'The JSON fragment supplied is invalid.',
  [ValidationErrorType.MISSING_REQUIRED_FIELD]: 'Required field is missing.',
  [ValidationErrorType.MISSING_RECOMMENDED_FIELD]: 'Recommended field is missing.',
  [ValidationErrorType.MODEL_NOT_FOUND]: 'Could not load definition for model',
  [ValidationErrorType.FIELD_NOT_IN_SPEC]: 'This field is not defined in the specification',
  [ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED]: 'The validator does not currently check experimental fields',
  [ValidationErrorType.INVALID_TYPE]: 'Field is an invalid type',
  [ValidationErrorType.INVALID_FORMAT]: 'Field is not in the correct format',
  [ValidationErrorType.FIELD_NOT_IN_DEFINED_VALUES]: 'This value supplied is not in the allowed values for this field',
  [ValidationErrorType.START_DATE_AFTER_END_DATE]: 'Start date is after the end date of the event',
};

module.exports = ValidationErrorMessage;
