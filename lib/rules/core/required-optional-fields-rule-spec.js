'use strict';

const RequiredOptionalFieldsRule = require('./required-optional-fields-rule');
const Model = require('../../model');

describe('RequiredOptionalFieldsRule', function() {
    const model = new Model({
        "type": "Event",
        "requiredOptions": [
            {
                "description": [
                    "While these properties are marked as optional, a data publisher must provide either a schema:startDate or specify a oa:schedule for an event."
                ],
                "options": [
                    "startDate",
                    "schedule"
                ]
            }
        ]
    });
    const rule = new RequiredOptionalFieldsRule();

    it('should target models of any type', function() {
        let isTargeted = rule.isModelTargeted(model);
        expect(isTargeted).toBe(true);
    });

    it('should return no errors if required optional fields are present', function() {
        let data = {
            "@context": "https://www.openactive.io/ns/oa.jsonld",
            "type": "Event",
            "startDate": "2018-01-27T12:00:00Z"
        };

        let errors = rule.validateModel(data, model, null);

        expect(errors.length).toBe(0);
    });

    it('should return a failure per option group if any required optional fields are missing', function() {
        let data = {
            "@context": "https://www.openactive.io/ns/oa.jsonld",
            "type": "Event"
        };

        let errors = rule.validateModel(data, model, null);

        expect(errors.length).toBe(1);

        expect(errors[0].type).toBe('missing_required_field');
        expect(errors[0].severity).toBe('failure');
        expect(errors[0].path).toBe('[\'startDate\', \'schedule\']');
        expect(errors[0].message).toBe(model.requiredOptions[0].description[0]);
    });
});
