const { DateTime } = require('luxon');

function getDateTime(ianaTimezone, dateString, timeString) {
  if (typeof dateString !== 'undefined' && typeof timeString !== 'undefined') {
    return DateTime.fromISO(`${dateString}T${timeString}`, { zone: ianaTimezone }).toJSDate();
  }
  return undefined;
}

module.exports = getDateTime;
