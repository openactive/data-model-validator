'use strict';

module.exports = [
    // Core rules
    require('./core/required-fields-rule'),
    require('./core/required-optional-fields-rule'),
    require('./core/fields-not-in-model-rule'),
    require('./core/beta-fields-rule'),
    require('./core/fields-correct-type-rule'),
    require('./core/fields-match-standard-rule'),
    require('./core/recommended-fields-rule'),

    // Formatting rules
    require('./format/duration-format-rule'),
    require('./format/datetime-format-rule'),
    require('./format/date-format-rule'),
    require('./format/currency-code-format-rule'),
    require('./format/country-code-format-rule'),

    // Logic rules
    require('./data-quality/end-before-start-rule')
];
