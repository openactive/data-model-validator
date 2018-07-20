/* eslint-disable global-require */

module.exports = [
  // Core rules
  require('./core/required-fields-rule'),
  require('./core/required-optional-fields-rule'),
  require('./core/fields-not-in-model-rule'),
  require('./core/fields-correct-type-rule'),
  require('./core/recommended-fields-rule'),
  require('./core/value-in-options-rule'),

  // Formatting rules
  require('./format/duration-format-rule'),
  require('./format/datetime-format-rule'),
  require('./format/time-format-rule'),
  require('./format/date-format-rule'),
  require('./format/currency-code-format-rule'),
  require('./format/country-code-format-rule'),
  require('./format/lat-long-format-rule'),

  // Logic rules
  require('./data-quality/end-before-start-rule'),
];

/* eslint-enable global-require */
