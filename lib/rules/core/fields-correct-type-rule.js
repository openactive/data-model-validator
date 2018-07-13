'use strict';

const Rule = require('../rule');
const Field = require('../../classes/field');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class FieldsCorrectTypeRule extends Rule {

    constructor(options) {
        super(options);
        this._targetFields = '*';
        this._description = "Validates that all fields are the correct type.";
    }

    validateField(data, field, model, parent) {
        if (typeof(model.fields[field]) === 'undefined') {
            return [];
        }

        // Get the derived type
        let fieldObj = new Field(model.fields[field]);
        let derivedType = fieldObj.detectType(data[field]);

        let typeChecks = fieldObj.getAllPossibleTypes();

        // TODO: Should this throw an error..?
        if (typeChecks.length === 0) {
            return [];
        }

        let checkPass = fieldObj.detectedTypeIsAllowed(data[field]);
        let errors = [];

        if (!checkPass) {
            let message;
            if (typeChecks.length === 1) {
                message = "Invalid type, expected '" + typeChecks[0] + "' but found '" + derivedType + "'";
            } else {
                message = "Invalid type, expected one of '" + typeChecks.join("', '") + "' but found '" + derivedType + "'";
            }
            errors.push(
                new ValidationError(
                    {
                        "category": ValidationErrorCategory.CONFORMANCE,
                        "type": ValidationErrorType.INVALID_TYPE,
                        "message": message,
                        "value": data[field],
                        "severity": ValidationErrorSeverity.FAILURE,
                        "path": field
                    }
                )
            );
        }

        return errors;
    }
}
