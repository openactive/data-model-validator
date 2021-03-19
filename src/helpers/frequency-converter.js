const { parse } = require('iso8601-duration');
const { RRule } = require('rrule');

function getFrequency(repeatFrequency) {
  if (typeof repeatFrequency !== 'undefined') {
    const frequency = parse(repeatFrequency);

    if (frequency.hours !== 0) {
      return { freq: RRule.HOURLY, interval: frequency.hours };
    }
    if (frequency.days !== 0) {
      return { freq: RRule.DAILY, interval: frequency.days };
    }
    if (frequency.weeks !== 0) {
      return { freq: RRule.WEEKLY, interval: frequency.weeks };
    }
    if (frequency.months !== 0) {
      return { freq: RRule.MONTHLY, interval: frequency.months };
    }
    if (frequency.years !== 0) {
      return { freq: RRule.YEARLY, interval: frequency.years };
    }
  }
  return { freq: undefined, interval: 0 };
}

module.exports = getFrequency;
