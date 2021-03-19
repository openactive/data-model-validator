function getDateTime(dateString, timeString) {
  let fullString = dateString;
  if (typeof timeString !== 'undefined') {
    fullString = `${fullString}T${timeString}`;
  }
  return new Date(fullString);
}

export default getDateTime;
