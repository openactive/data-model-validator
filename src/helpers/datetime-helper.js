function getDateTime(dateString, timeString) {
  if (typeof dateString !== 'undefined' && typeof timeString !== 'undefined') {
    return new Date(`${dateString}T${timeString}`);
  }
  if (typeof dateString !== 'undefined') {
    return new Date(dateString);
  }
  return undefined;
}

module.exports = getDateTime;
