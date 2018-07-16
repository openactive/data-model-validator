'use strict';

let ValidationErrorType = {
    INVALID_JSON: "invalid_json",
    MISSING_REQUIRED_FIELD: "missing_required_field",
    MISSING_RECOMMENDED_FIELD: "missing_recommended_field",
    MODEL_NOT_FOUND: "model_not_found",
    FIELD_NOT_IN_SPEC: "field_not_in_spec",
    BETA_FIELDS_NOT_CHECKED: "beta_fields_not_checked",
    INVALID_TYPE: "invalid_type",
    INVALID_FORMAT: "invalid_format",
    START_DATE_AFTER_END_DATE: "start_date_after_end_date"
};

module.exports = Object.freeze(ValidationErrorType);
