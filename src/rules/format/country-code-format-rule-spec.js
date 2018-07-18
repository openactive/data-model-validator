'use strict';

const CountryCodeFormatRule = require('./country-code-format-rule');
const Model = require('../../classes/model');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('CountryCodeFormatRule', function() {
    const rule = new CountryCodeFormatRule();

    const model = new Model({
        "type": "Event",
        "fields": {
            "country": {
                "fieldName": "country",
                "sameAs": "http://schema.org/addressCountry",
                "requiredType": "http://schema.org/Text"
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

    // ISO3166-1-ALPHA2
    it('should return no error for an valid country code', function() {
        let values = [
            "GB",
            "CN",
            "US"
        ];

        for (let value of values) {
            let data = {
                "country": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(0);
        }
    });
    it('should return an error for an invalid country code', function() {
        let values = [
            "BC",
            "QB",
            "ZY",
            "A"
        ];

        for (let value of values) {
            let data = {
                "country": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
            expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });
});
