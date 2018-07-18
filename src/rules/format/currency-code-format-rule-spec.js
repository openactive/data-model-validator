'use strict';

const CurrencyCodeFormatRule = require('./currency-code-format-rule');
const Model = require('../../classes/model');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('CurrencyCodeFormatRule', function() {
    const rule = new CurrencyCodeFormatRule();

    const model = new Model({
        "type": "Event",
        "fields": {
            "currency": {
                "fieldName": "currency",
                "requiredType": "http://schema.org/Text",
                "sameAs": "http://schema.org/priceCurrency"
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

    // ISO4217-3LETTER
    it('should return no error for an valid currency code', function() {
        let values = [
            "GBP",
            "JPY",
            "USD"
        ];

        for (let value of values) {
            let data = {
                "currency": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(0);
        }
    });
    it('should return an error for an invalid currency code', function() {
        let values = [
            "XAA",
            "XAB",
            "GB"
        ];

        for (let value of values) {
            let data = {
                "currency": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
            expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });
});
