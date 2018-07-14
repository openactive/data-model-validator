'use strict';

const Rule = require('../rule');
const Field = require('../../classes/field');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class DurationFormatRule extends Rule {

    constructor(options) {
        super(options);
        this._targetFields = '*';
        this._description = "Validates that duration fields are in the correct format.";
    }

    validateField(data, field, model, parent) {
        if (typeof(model.fields[field]) === 'undefined') {
            return [];
        }
        let errors = [];
        let fieldObj = new Field(model.fields[field]);
        let type = fieldObj.detectType(data[field]);
        if (type === 'http://schema.org/Duration'
            || fieldObj.isOnlyType('http://schema.org/Duration')
        ) {
            if (!this.regex.test(data[field])) {
                errors.push(
                    new ValidationError(
                        {
                            "category": ValidationErrorCategory.CONFORMANCE,
                            "type": ValidationErrorType.INVALID_FORMAT,
                            "message": "Durations should be expressed as ISO 8601 durations",
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

    get regex() {
        // See https://en.wikipedia.org/wiki/ISO_8601
        // NOTE: moment should not be used to validate durations, it is
        // too lenient - it allows time components without the T, and
        // fractions of units all the way through the string, and allows
        // the character 'P'
        return new RegExp(
            '^P('
            +'('
              // Necessary, because each final term in the string can be a fraction
              +'([0-9]+Y)?([0-9]+M)?([0-9]+D)?T([0-9]+H)?([0-9]+M)?([0-9]+(?:[,\\.][0-9]+)?S)'
              +'|([0-9]+Y)?([0-9]+M)?([0-9]+D)?T([0-9]+H)?([0-9]+(?:[,\\.][0-9]+)?M)'
              +'|([0-9]+Y)?([0-9]+M)?([0-9]+D)?T([0-9]+(?:[,\\.][0-9]+)?H)'
              +'|([0-9]+Y)?([0-9]+M)?([0-9]+(?:[,\\.][0-9]+)?D)'
              +'|([0-9]+Y)?([0-9]+(?:[,\\.][0-9]+)?M)'
              +'|([0-9]+(?:[,\\.][0-9]+)?Y)'
            +')'
            +'|([0-9]+W)'
            + ')$'
        )
    }
}
