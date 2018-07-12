'use strict';

let Field = class {
    
    constructor(data) {
        this._data = data;
    }
    
    get fieldName() {
        return this._data.fieldName;
    }
    
    get requiredType() {
        return this._data.requiredType;
    }
    
    get requiredContent() {
        return this._data.requiredContent;
    }
    
    get description() {
        return this._data.description;
    }
    
    get example() {
        return this._data.example;
    }
    
    get model() {
        return this._data.model;
    }
    
    get alternativeModels() {
        return this._data.alternativeModels || [];
    }
    
    get alternativeTypes() {
        return this._data.alternativeTypes || [];
    }
    
    get context() {
        return this._data.context;
    }
    
    get standard() {
        return this._data.standard;
    }
    
    get options() {
        return this._data.options;
    }
    
    getPossibleModels() {
        let models = [];
        if (typeof(this.model) !== undefined && this.model !== null) {
            models.push(this.model);
        }
        return models.concat(this.alternativeModels);
    }
    
}

module.exports = Field;