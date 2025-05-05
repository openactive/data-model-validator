const { DateTime } = require('luxon');

function getDateTime(ianaTimezone, dateString, timeString) {
  // Node pulls the timezone from the system on initialisation using the TZ environment variable.
  // We can change process.env.TZ to UTC. This will update the current Node process.
  process.env.TZ = 'UTC';
  if (typeof dateString !== 'undefined' && typeof timeString !== 'undefined') {
    return DateTime.fromISO(`${dateString}T${timeString}`, { zone: ianaTimezone }).toJSDate();
  }
  return undefined;
}

module.exports = getDateTime;
