'use strict';

const RequiredFieldsRule = require('./required-fields-rule');
const Model = require('../../classes/model');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('RequiredFieldsRule', function() {
    let model = new Model({
        "type": "Event",
        "requiredFields": [
            "@context",
            "activity",
            "location"
        ]
    });
    model.hasSpecification = true;

    const rule = new RequiredFieldsRule();

    it('should target models of any type', function() {
        let isTargeted = rule.isModelTargeted(model);
        expect(isTargeted).toBe(true);
    });

    it('should return no errors if all required fields are present', function() {
        let data = {
            "@context": "https://www.openactive.io/ns/oa.jsonld",
            "type": "Event",
            "activity": {
                "id": "https://example.com/reference/activities#Speedball",
                "inScheme": "https://example.com/reference/activities",
                "prefLabel": "Speedball",
                "type": "Concept"
            },
            "location": {
                "address": {
                    "addressLocality": "New Malden",
                    "addressRegion": "London",
                    "postalCode": "NW5 3DU",
                    "streetAddress": "Raynes Park High School, 46A West Barnes Lane",
                    "type": "PostalAddress"
                },
                "description": "Raynes Park High School in London",
                "geo": {
                    "latitude": 51.4034423828125,
                    "longitude": -0.2369088977575302,
                    "type": "GeoCoordinates"
                },
                "id": "https://example.com/locations/1234ABCD",
                "identifier": "1234ABCD",
                "name": "Raynes Park High School",
                "telephone": "01253 473934",
                "type": "Place"
            }
        };

        let errors = rule.validate(data, model, null);

        expect(errors.length).toBe(0);
    });

    it('should return a failure per field if any required fields are missing', function() {
        let data = {
            "@context": "https://www.openactive.io/ns/oa.jsonld",
            "type": "Event"
        };

        let errors = rule.validate(data, model, null);

        expect(errors.length).toBe(2);

        for (let error of errors) {
            expect(error.type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
            expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });
});
