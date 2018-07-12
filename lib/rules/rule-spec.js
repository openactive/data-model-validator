'use strict';

const Rule = require('./rule');
const Model = require('../model');

describe('Rule', function() {
    const model = new Model({
        "type": "Event",
        "requiredFields": [
            "@context",
            "activity",
            "location"
        ]
    });
    const rule = new Rule();

    it('should not target any models', function() {
        let isTargeted = rule.isModelTargeted(model);
        expect(isTargeted).toBe(false);
    });

    it('should not target any fields', function() {
        let isTargeted = rule.isFieldTargeted(model, '*');
        expect(isTargeted).toBe(false);
    });

    it('should throw if trying to validate a model', function() {
        let data = {};
        expect(function() {
            let errors = rule.validateModel(data, model, null);
        }).toThrow();
    });

    it('should throw if trying to validate a field', function() {
        let data = {};
        let field = 'field';
        expect(function() {
            let errors = rule.validateField(data, field, model, null);
        }).toThrow();
    });
});
