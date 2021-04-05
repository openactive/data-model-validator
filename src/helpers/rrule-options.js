const getDateTime = require('./datetime-helper');

function generateRRuleOptions(properties) {
  const toRruleDate = (date, time) => getDateTime('UTC', date, time);

  const dtStart = toRruleDate(properties.startDate, properties.startTime);
  const dtEnd = toRruleDate(properties.endDate, properties.endTime);

  const rruleOptions = {};

  if (typeof properties.freq !== 'undefined') {
    rruleOptions.freq = properties.freq;
  }
  if (typeof properties.interval !== 'undefined') {
    rruleOptions.interval = properties.interval;
  }
  if (typeof dtStart !== 'undefined') {
    rruleOptions.dtstart = dtStart;
  }
  if (typeof dtEnd !== 'undefined') {
    rruleOptions.until = dtEnd;
  }
  if (typeof properties.byDay !== 'undefined') {
    rruleOptions.byweekday = properties.byDay;
  }
  if (typeof properties.byMonth !== 'undefined') {
    rruleOptions.bymonth = properties.byMonth;
  }
  if (typeof properties.byMonthDay !== 'undefined') {
    rruleOptions.bymonthday = properties.byMonthDay;
  }
  if (typeof properties.count !== 'undefined') {
    rruleOptions.count = properties.count;
  }
  if (typeof properties.scheduleTimezone !== 'undefined') {
    rruleOptions.tzid = properties.scheduleTimezone;
  }
  return rruleOptions;
}

module.exports = generateRRuleOptions;
