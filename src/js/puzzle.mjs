
export { dateIndex };

// One day is this many milliseconds
const dateUpdateInterval = 1000 * 60 * 60 * 24;
// Updates one hour earlier to be at midnight Western Europe winter time
const updateTimeOffset = 1000 * 60 * 60;
// Day of puzzle 0
const startDateIndex = 20104;
// Current date in dex
const dateIndex = Math.floor((new Date().getTime() + updateTimeOffset) /
dateUpdateInterval) - startDateIndex;

