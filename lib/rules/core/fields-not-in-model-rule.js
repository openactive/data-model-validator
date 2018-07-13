'use strict';

const Rule = require('../rule');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

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
                        "category": ValidationErrorCategory.CONFORMANCE,
                        "type": ValidationErrorType.FIELD_NOT_IN_SPEC,
                        "value": data[field],
                        "severity": ValidationErrorSeverity.WARNING,
                        "path": field
                    }
                )
            );
        }
        return errors;
    }
}
