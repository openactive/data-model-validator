'use strict';

const moment = require('moment');
const Rule = require('../rule');
const Field = require('../../classes/field');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class DatetimeFormatRule extends Rule {

    constructor(options) {
        super(options);
        this._targetFields = '*';
        this._description = "Validates that DateTime fields are in the correct format.";
    }

    validateField(data, field, model, parent) {
        if (typeof(model.fields[field]) === 'undefined') {
            return [];
        }
        let errors = [];
        let fieldObj = new Field(model.fields[field]);
        let type = fieldObj.detectType(data[field]);
        if (type === 'http://schema.org/DateTime'
            || fieldObj.isOnlyType('http://schema.org/DateTime')
        ) {
            if (!moment(data[field], 'YYYY-MM-DD\THH:mm:ssZZ', true).isValid()) {
                errors.push(
                    new ValidationError(
                        {
                            "category": ValidationErrorCategory.CONFORMANCE,
                            "type": ValidationErrorType.INVALID_FORMAT,
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
