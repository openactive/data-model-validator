'use strict';

const moment = require('moment');
const Rule = require('../rule');
const Field = require('../../classes/field');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class DateFormatRule extends Rule {

    constructor(options) {
        super(options);
        this._targetFields = '*';
        this._description = "Validates that Date fields are in the correct format.";
    }

    validateField(data, field, model, parent) {
        if (typeof(model.fields[field]) === 'undefined') {
            return [];
        }
        let errors = [];
        let fieldObj = new Field(model.fields[field]);
        let type = fieldObj.detectType(data[field]);
        if (type === 'http://schema.org/Date'
            || fieldObj.isOnlyType('http://schema.org/Date')
        ) {
            if (
                !moment(data[field], 'YYYY-MM-DD', true).isValid()
                && !moment(data[field], 'YYYYMMDD', true).isValid()
            ) {
                errors.push(
                    new ValidationError(
                        {
                            "category": ValidationErrorCategory.CONFORMANCE,
                            "type": ValidationErrorType.INVALID_FORMAT,
                            "message": "Dates should be expressed as ISO 8601 dates",
                            "value": data[field],
                            "severity": ValidationErrorSeverity.FAILURE,
                            "path": field
                        }
                    )
                );
            }
        }
        return errors;
    }
}
