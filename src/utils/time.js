export function unixSecondsToIsoDate(unixTimeSeconds) {
  return new Date(unixTimeSeconds * 1000).toISOString().slice(0, 10);
}

export function getUnixDate() {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime() / 1000;
}
