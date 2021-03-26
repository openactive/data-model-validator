const getFrequency = require('./frequency-converter');

function getScheduleProperties(node) {
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
  return properties;
}

module.exports = getScheduleProperties;
