'use strict';

const fs = require('fs');
const path = require('path');

const loader = {

    loadModel: function(name) {
        let jsonPath = path.join(__dirname, 'models', name + '.json');
        let data = fs.readFileSync(jsonPath, 'utf8');
        let model;
        try {
            model = JSON.parse(data);
        } catch (e) {
            return console.log(e);
        }
        return model;
    }
}

module.exports = loader;
