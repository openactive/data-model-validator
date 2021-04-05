const { DateTime } = require('luxon');

function getDateTime(ianaTimezone, dateString, timeString) {
  if (process.env.TZ !== 'UTC') {
    throw new Error(`Schedule generation logic relies on 'TZ' env var being set to 'UTC'. It is currently: ${process.env.TZ}`);
  }
  if (typeof dateString !== 'undefined' && typeof timeString !== 'undefined') {
    return DateTime.fromISO(`${dateString}T${timeString}`, { zone: ianaTimezone }).toJSDate();
  }
  return undefined;
}

module.exports = getDateTime;
