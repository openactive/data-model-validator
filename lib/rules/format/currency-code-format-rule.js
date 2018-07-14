'use strict';

const cc = require('currency-codes');
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
        this._description = "Validates that currency code fields are in the correct format.";
    }

    validateField(data, field, model, parent) {
        if (typeof(model.fields[field]) === 'undefined') {
            return [];
        }
        let errors = [];
        let fieldObj = new Field(model.fields[field]);
        if (fieldObj.sameAs === 'http://schema.org/priceCurrency') {
            if (typeof(cc.code(data[field])) === 'undefined') {
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
