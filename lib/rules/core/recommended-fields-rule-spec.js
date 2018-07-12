'use strict';

const RecommendedFieldsRule = require('./recommended-fields-rule');
const Model = require('../../model');

describe('RecommendedFieldsRule', function() {
    const model = new Model({
        "type": "Event",
        "recommendedFields": [
            "description",
            "name"
        ]
    });
    const rule = new RecommendedFieldsRule();

    it('should target models of any type', function() {
        let isTargeted = rule.isModelTargeted(model);
        expect(isTargeted).toBe(true);
    });

    it('should return no errors if all recommended fields are present', function() {
        let data = {
            "@context": "https://www.openactive.io/ns/oa.jsonld",
            "type": "Event",
            "name": "Tai chi Class",
            "description": "A class about Tai Chi"
        };

        let errors = rule.validateModel(data, model, null);

        expect(errors.length).toBe(0);
    });

    it('should return a warning per field if any recommended fields are missing', function() {
        let data = {
            "@context": "https://www.openactive.io/ns/oa.jsonld",
            "type": "Event"
        };

        let errors = rule.validateModel(data, model, null);

        expect(errors.length).toBe(2);

        for (let error of errors) {
            expect(error.type).toBe('missing_recommended_field');
            expect(error.severity).toBe('warning');
        }
    });
});
