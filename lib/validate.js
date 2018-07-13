'use strict';

const jp = require('jsonpath');
const loader = require('./loader');
const Model = require('./classes/model');
const ValidationError = require('./validation-error');

module.exports = validate;

function validate(value, model, options) {
    // Load the model (if it exists)
    let modelObject;
    try {
        modelObject = loadModel(model)
    } catch (e) {
        return [
            new ValidationError({
                "category": "internal",
                "type": "model_not_found",
                "value": "#" + model,
                "severity": "failure",
                "path": null
            })
        ];
    }

    // Load the rules
    const rules = require('./rules');
    let ruleObjects = [];
    for (let index in rules) {
        ruleObjects.push(new rules[index]());
    }

    let errors = applyModelRules(ruleObjects, value, modelObject, null, '$');

    return errors.map((x) => x.data);
}

function loadModel(model) {
    let modelData = loader.loadModel(model);
    let modelObject;

    if (modelData) {
        modelObject = new Model(modelData);
    }
    return modelObject;
}

function applyModelRules(rules, data, model, parent, path) {
    let errors = [];
    for (let rule of rules) {
        errors = processErrors(rule.validate(data, model, parent), errors, path);
    }
    for (let field in data) {
        // If this field is itself a model, apply that model's rules to it
        errors = errors.concat(applySubModelRules(rules, data, field, model, parent, path));
    }
    return errors;
}

function applySubModelRules(rules, data, field, model, parent, path) {
    let errors = [];

    // Can this field be a model (or array of models?)
    let possibleModels = model.getPossibleModelsForField(field);
    if (!possibleModels.length) {
        return [];
    }

    if (
        typeof(data[field]) === 'object'
        && typeof(data[field].type) !== 'undefined'
        && possibleModels.indexOf('#' + data[field].type) >= 0
    ) {
        // We need to load the new model
        let subModelData
        try {
            subModelData = loadModel(data[field].type);
        } catch (e) {}
        if (subModelData) {
            let subModel = new Model(subModelData);
            let subModelErrors = applyModelRules(
                rules,
                data[field],
                subModel,
                data,
                path + '.' + field
            );
            errors = errors.concat(subModelErrors);
        } else {
            errors.push(
                new ValidationError({
                    "category": "internal",
                    "type": "model_not_found",
                    "value": "#" + data[field].type,
                    "severity": "warning",
                    "path": path + '.' + field
                })
            );
        }
    } else if (data[field] instanceof Array) {
        let index = 0;
        // Check that the whole array is of the same type
        let uniqueTypes = getArrayTypes(data[field]);
        if (uniqueTypes.length !== 1
            || possibleModels.indexOf('ArrayOf#' + uniqueTypes[0]) < 0
        ) {
            return [];
        }
        let subModelData;
        try {
            subModelData = loadModel(uniqueTypes[0]);
        } catch (e) {}
        if (subModelData) {
            for (let fieldValue of data[field]) {
                let subModel = new Model(subModelData);
                let subModelErrors = applyModelRules(
                    rules,
                    fieldValue,
                    subModel,
                    data,
                    path + '.' + field + '[' + index + ']'
                );
                errors = errors.concat(subModelErrors);
            }
            index += 1;
        } else {
            errors.push(
                new ValidationError({
                    "category": "internal",
                    "type": "model_not_found",
                    "value": "#" + uniqueTypes[0],
                    "severity": "warning",
                    "path": path + '.' + field + '[' + index + ']'
                })
            );
        }
    }
    return errors;
}

function getArrayTypes(array) {
    // Map the array to their types
    let types = array.map((x) => {
        if (typeof(x) === 'object'
            && typeof(x.type) !== 'undefined'
        ) {
            return x.type;
        }
        return typeof(x);
    });
    // Make unique
    return [...new Set(types)];
}

function processErrors(newErrors, existingErrors, path) {
    for (let error of newErrors) {
        error.path = path + (error.path ? '.' + error.path : '');
    }
    return existingErrors.concat(newErrors);
}
