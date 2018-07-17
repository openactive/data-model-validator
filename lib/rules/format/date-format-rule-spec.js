'use strict';

const DateFormatRule = require('./date-format-rule');
const Model = require('../../classes/model');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('DateFormatRule', function() {
    const rule = new DateFormatRule();

    const model = new Model({
        "type": "Event",
        "fields": {
            "date": {
                "fieldName": "date",
                "requiredType": "http://schema.org/Date"
            }
        }
    });

    it('should target fields of any type', function() {
        let model = new Model({
            "type": "Event"
        });
        let isTargeted = rule.isFieldTargeted(model, 'type');
        expect(isTargeted).toBe(true);
    });

    // ISO8601Date
    it('should return no error for an valid date', function() {
        let values = [
            "2017-09-06",
            "20180115"
        ];

        for (let value of values) {
            let data = {
                "date": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(0);
        }
    });
    it('should return an error for an invalid date', function() {
        let values = [
            "2017-12-06T09:00:00",
            "2018-13-17",
            "ABC",
            "2017-02-29" // Not a leap year
        ];

        for (let value of values) {
            let data = {
                "date": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
            expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });
});
