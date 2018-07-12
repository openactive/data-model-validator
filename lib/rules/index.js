'use strict';

module.exports = [
    require('./core/required-fields-rule'),
    require('./core/required-optional-fields-rule'),
    require('./core/fields-not-in-model-rule'),
    require('./core/beta-fields-rule'),
    require('./core/recommended-fields-rule')
];
