function getDateTime(dateString, timeString) {
  if (typeof timeString !== 'undefined') {
    return new Date(`${dateString}T${timeString}`);
  }
  if (typeof dateString !== 'undefined') {
    return new Date(dateString);
  }
  return undefined;
}

module.exports = getDateTime;
