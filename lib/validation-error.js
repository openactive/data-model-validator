'use strict';

const jp = require('jsonpath');

let ValidationError = class {

    constructor(data) {
        if ((typeof(data.message) === 'undefined'
            || data.message === null)
            && typeof(data.type) !== 'undefined'
            && typeof(this.constructor.types[data.type]) !== 'undefined'
        ) {
            data.message = this.constructor.types[data.type];
        }
        this._data = data;
    }

    get data() {
        return {
            "category": this.category,
            "type": this.type,
            "message": this.message,
            "value": this.value,
            "severity": this.severity,
            "path": this.path
        };
    }

    get category() {
        return this._data.category;
    }

    get type() {
        return this._data.type;
    }

    get message() {
        return this._data.message;
    }

    get severity() {
        return this._data.severity;
    }

    set path(path) {
        this._data.path = path;
    }

    get path() {
        return this._data.path;
    }

    get value() {
        return this._data.value;
    }
}

ValidationError.severities = {
    "failure": "Failure",
    "warning": "Warning",
    "notice": "Notice",
    "suggestion": "Suggestion"
};

ValidationError.categories = {
    "conformance": "Conformance",
    "data-quality": "Data Quality",
    "recommendation": "Recommendation",
    "internal": "Internal" // Internal problem library
};

ValidationError.types = {
    "invalid_json": "The JSON fragment supplied is invalid.",
    "missing_required_field": "Required field is missing.",
    "missing_recommended_field": "Recommended field is missing.",
    "model_not_found": "Could not load definition for model",
    "field_not_in_spec": "This field is not defined in the specification",
    "beta_fields_not_checked": "The validator does not currently check experimental fields",
    "invalid_type": "Field is an invalid type"
};

module.exports = ValidationError;
