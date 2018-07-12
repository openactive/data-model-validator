'use strict';

const FieldsNotInModelRule = require('./fields-not-in-model-rule');
const Model = require('../../model');

describe('FieldsNotInModelRule', function() {
    const model = new Model({
        "type": "Event",
        "inSpec": [
            "@context",
            "type",
            "activity",
            "location"
        ]
    });
    const rule = new FieldsNotInModelRule();

    it('should target models of any type', function() {
        let isTargeted = rule.isModelTargeted(model);
        expect(isTargeted).toBe(true);
    });

    it('should return no errors if all fields are in the spec', function() {
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

        let errors = rule.validateModel(data, model, null);

        expect(errors.length).toBe(0);
    });

    it('should return a failure per field if any fields are not in the spec', function() {
        let data = {
            "@context": "https://www.openactive.io/ns/oa.jsonld",
            "type": "Event",
            "invalid_field": "This field is not in the spec",
            "another_invalid_field": "This field is also not in the spec"
        };

        let errors = rule.validateModel(data, model, null);

        expect(errors.length).toBe(2);

        for (let error of errors) {
            expect(error.type).toBe('field_not_in_spec');
            expect(error.severity).toBe('warning');
        }
    });
});
