'use strict';

const Rule = require('../rule');
const ValidationError = require('../../validation-error');

module.exports = class FieldsNotInModelRule extends Rule {

    constructor(options) {
        super(options);
        this._targetFields = '*';
        this._description = "Validates that all fields are present in the specification.";
    }

    validateField(data, field, model, parent) {
        let errors = [];
        if (model.inSpec.indexOf(field) < 0) {
            errors.push(
                new ValidationError(
                    {
                        "category": "conformance",
                        "type": "field_not_in_spec",
                        "value": data[field],
                        "severity": "warning",
                        "path": field
                    }
                )
            );
        }
        return errors;
    }
}
