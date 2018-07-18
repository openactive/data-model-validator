/*!
 * data-model-validator
 * MIT Licensed
 */

'use strict';

exports = module.exports = createValidator();

function createValidator() {

    let root = {
        validate: require('./validate')
    };

    return root;
}
