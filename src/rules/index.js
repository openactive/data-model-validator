/* eslint-disable global-require */

module.exports = {
  raw: [
    require('./raw/valid-input-rule'),
    require('./raw/rpde-feed-rule'),
  ],
  core: [
    // Core rules
    require('./core/valid-model-type-rule'),
    require('./core/required-fields-rule'),
    require('./core/required-optional-fields-rule'),
    require('./core/fields-not-in-model-rule'),
    require('./core/fields-correct-type-rule'),
    require('./core/recommended-fields-rule'),
    require('./core/no-empty-values-rule'),
    require('./core/value-in-options-rule'),
    require('./core/value-is-required-content-rule'),
    require('./core/precision-rule'),
    require('./core/no-prefix-or-namespace-rule'),
    require('./core/context-in-root-node-rule'),

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
    require('./data-quality/dates-must-have-duration-rule'),
    require('./data-quality/no-zero-duration-rule'),
    require('./data-quality/max-less-than-min-rule'),
    require('./data-quality/age-range-min-or-max-rule'),
    require('./data-quality/activity-in-activity-list-rule'),
    require('./data-quality/is-accessible-for-free-rule'),
    require('./data-quality/address-trailing-comma-rule'),
    require('./data-quality/no-html-rule'),
    require('./data-quality/concept-id-in-scheme-rule'),
    require('./data-quality/concept-no-props-if-inscheme-rule'),
    require('./data-quality/openactive-urls-correct-rule'),
    require('./data-quality/thumbnail-has-no-thumbnail-rule'),
    require('./data-quality/address-warning-rule'),
    require('./data-quality/event-no-schedule-subevent-rule'),
    require('./data-quality/session-course-has-subevent-or-schedule-rule'),
    require('./data-quality/scheduled-session-must-be-subevent-rule'),
    require('./data-quality/session-series-schedule-type-rule'),
    require('./data-quality/currency-if-non-zero-price-rule'),
    require('./data-quality/if-needs-booking-must-have-valid-offer-rule'),

    // Notes on the data consumer
    require('./consumer-notes/assume-no-gender-restriction-rule'),
    require('./consumer-notes/assume-age-range-rule'),
    require('./consumer-notes/assume-event-status-rule'),
  ],
};

/* eslint-enable global-require */
