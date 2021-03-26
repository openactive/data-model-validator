const getFrequency = require('./frequency-converter');
const getDateTime = require('./datetime-helper');

function generateRRuleOptions(node) {
  const { freq, interval } = getFrequency(node.getValue('repeatFrequency'));
  const properties = {
    freq,
    interval,
    byDay: node.getValue('byDay'),
    byMonth: node.getValue('byMonth'),
    byMonthDay: node.getValue('byMonthDay'),
    startDate: node.getValue('startDate'),
    startTime: node.getValue('startTime'),
    endDate: node.getValue('endDate'),
    endTime: node.getValue('endTime'),
    count: node.getValue('count'),
    scheduleTimezone: node.getValue('scheduleTimezone'),
    exceptDate: node.getValue('exceptDate'),
  };

  console.info(properties.startDate, properties.startTime);

  const dtStart = getDateTime(properties.startDate, properties.startTime);
  const dtEnd = getDateTime(properties.endDate, properties.endTime);

  const rruleOptions = { freq, interval }; // this is the only required one

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
  return { rruleOptions, properties };
}

module.exports = generateRRuleOptions;
