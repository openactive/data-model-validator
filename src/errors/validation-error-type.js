

const ValidationErrorType = {
  INVALID_JSON: 'invalid_json',
  MISSING_REQUIRED_FIELD: 'missing_required_field',
  MISSING_RECOMMENDED_FIELD: 'missing_recommended_field',
  MODEL_NOT_FOUND: 'model_not_found',
  FILE_NOT_FOUND: 'file_not_found',
  FIELD_NOT_IN_SPEC: 'field_not_in_spec',
  FIELD_COULD_BE_TYPO: 'field_could_be_typo',
  EXPERIMENTAL_FIELDS_NOT_CHECKED: 'experimental_fields_not_checked',
  UNSUPPORTED_VALUE: 'unsupported_value',
  INVALID_TYPE: 'invalid_type',
  INVALID_FLEXIBLE_TYPE: 'invalid_flexible_type',
  INVALID_FORMAT: 'invalid_format',
  NO_HTML: 'no_html',
  INVALID_PRECISION: 'invalid_precision',
  FIELD_IS_EMPTY: 'field_is_empty',
  FIELD_NOT_IN_DEFINED_VALUES: 'field_not_in_defined_values',
  START_DATE_AFTER_END_DATE: 'start_date_after_end_date',
  MIN_VALUE_GREATER_THAN_MAX_VALUE: 'min_value_greater_than_max_value',
  DATES_MUST_HAVE_DURATION: 'dates_must_have_duration',
  NO_ZERO_DURATION: 'no_zero_duration',
  CONSUMER_ASSUME_NO_GENDER_RESTRICTION: 'consumer_assume_no_gender_restriction',
  CONSUMER_ASSUME_AGE_RANGE: 'consumer_assume_age_range',
  CONSUMER_ASSUME_EVENT_STATUS: 'consumer_assume_event_status',
  ACTIVITY_NOT_IN_ACTIVITY_LIST: 'activity_not_in_activity_list',
  MISSING_IS_ACCESSIBLE_FOR_FREE: 'missing_is_accessible_for_free',
  ADDRESS_HAS_TRAILING_COMMA: 'address_has_trailing_comma',
  CONCEPT_ID_AND_IN_SCHEME_TOGETHER: 'concept_id_and_in_scheme_together',
  SCHEMA_ORG_FIELDS_NOT_CHECKED: 'schema_org_fields_not_checked',
};

module.exports = Object.freeze(ValidationErrorType);
