const { RRule } = require('rrule');
const moment = require('moment');


function getFrequency(repeatFrequency) {
  if (typeof repeatFrequency !== 'undefined') {
    const frequency = moment.duration(repeatFrequency);
    // Making some sweeping assumptions about value here,
    // eg. that only one of the periods will be set: only day, or only month, etc
    // Doesn't bother with minutes or seconds
    // Returns {frequency, interval}
    if (frequency.hours() === 1) {
      return { freq: RRule.HOURLY, interval: 1 };
    }
    if (frequency.days() === 1 || frequency.hours() === 24) {
      return { freq: RRule.DAILY, interval: 1 };
    }
    if (frequency.weeks() === 1 || frequency.days() === 7) {
      return { freq: RRule.WEEKLY, interval: 1 };
    }
    if (frequency.weeks() === 2 || frequency.days() === 14) {
      return { freq: RRule.WEEKLY, interval: 2 };
    }
    if (frequency.months() === 1) {
      return { freq: RRule.MONTHLY, interval: 1 };
    }
    if (frequency.years() === 1 || frequency.months() === 12) {
      return { freq: RRule.YEARLY, interval: 1 };
    }
  }
  return { freq: undefined, interval: undefined };
}

module.exports = getFrequency;
