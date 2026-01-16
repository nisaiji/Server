import dayjs from "dayjs";

/**
 *
 * @param {*} year number
 * @param {*} month number
 * @returns  array of days in a month
 */
export function getDaysArray(year, month) {
  var numDaysInMonth, daysInWeek, daysIndex, index, i, l, daysArray;

  numDaysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  daysInWeek = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  daysIndex = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  index = daysIndex[new Date(year, month - 1, 1).toString().split(" ")[0]];
  daysArray = [];

  for (i = 0, l = numDaysInMonth[month - 1]; i < l; i++) {
    daysArray.push(i + 1 + ". " + daysInWeek[index++]);
    if (index == 7) index = 0;
  }

  return daysArray;
}

/**
 *
 * @param {*} date timestamp
 */
export function isSaturday(date) {
  return 6 === new Date(date).getDay();
}

// // Week starting Sunday (0) – default
// startOfWeekDayjs('2024-09-04'); // returns Sunday of that calendar week

// // Week starting Monday (1), like ISO style
// startOfWeekDayjs('2024-09-04', { weekStartsOn: 1 }); // returns Monday of that week
export function startOfWeek(date, options = {}) {
  const weekStartsOn = options.weekStartsOn ?? 0; // default Sunday, like date-fns
  if (weekStartsOn < 0 || weekStartsOn > 6) {
    throw new RangeError(
      "weekStartsOn must be between 0 (Sunday) and 6 (Saturday)"
    );
  }
  const d = dayjs(date);
  if (!d.isValid()) throw new Error("Invalid date");

  // JS getDay(): 0 = Sunday ... 6 = Saturday
  const currentDay = d.day(); // 0–6 regardless of locale

  // How many days to subtract to reach the start of the week
  // same formula date-fns uses: (day + 7 - weekStartsOn) % 7
  const diff = (currentDay + 7 - weekStartsOn) % 7;

  // Subtract diff days and go to start of day
  return d.subtract(diff, "day").startOf("day").toDate();
}

/**
 * Day.js equivalent of date-fns endOfWeek.
 *
 * @param {Date | string | number | dayjs.Dayjs} date
 * @param {Object} [options]
 * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - 0=Sunday, 1=Monday, ... (same week start as startOfWeek)
 * @returns {Date} JS Date at end of that week (23:59:59.999 local time)
 */
export function endOfWeekDayjs(date, options = {}) {
  const weekStartsOn = options.weekStartsOn ?? 0; // default Sunday, like date-fns
  if (weekStartsOn < 0 || weekStartsOn > 6) {
    throw new RangeError(
      "weekStartsOn must be between 0 (Sunday) and 6 (Saturday)"
    );
  }

  const d = dayjs(date);
  if (!d.isValid()) throw new Error("Invalid date");

  // JS getDay(): 0 = Sunday ... 6 = Saturday
  const currentDay = d.day();

  // Days to subtract to reach start of week
  const daysToStart = (currentDay + 7 - weekStartsOn) % 7;

  // Days to end of week = 6 (Saturday relative to start) - days to start
  const daysToEnd = 6 - daysToStart;

  // Add days to end of week and set to end of that day
  return d.add(daysToEnd, "day").endOf("day").toDate();
}

// Detect the last working day of the month, assuming working days are Mon-Sat.
export function detectLastWorkingDayOfMonth(currentDate) {
  let date = new Date(currentDate);
  while (
    !isLastDayOfMonth(date) ||
    ![1, 2, 3, 4, 5, 6].includes(getDay(date))
  ) {
    // Mon-Sat are working days
    date = new Date(date.getTime() + 24 * 60 * 60 * 1000);
  }
  return date;
}

export function isLastDayOfMonth(date) {
  return new Date().getDate() === new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export function formatDate(date, formatStr) {
  const d = dayjs(date);
  if (!d.isValid()) throw new Error("Invalid date");

  return d.format(formatStr);
}

/**
 *
 * @param {Date | string | number | dayjs.Dayjs} date
 * @param {number} amount - number of weeks to subtract
 * @param {Object} [options]
 * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - 0=Sunday, 1=Monday, ... (for consistent week boundaries)
 * @returns {Date} JS Date with the specified number of weeks subtracted
 */
export function subWeeks(date, amount, options = {}) {
  const weekStartsOn = options.weekStartsOn ?? 0;
  if (!Number.isInteger(amount) || amount < 0) {
    throw new RangeError("amount must be a positive integer");
  }
  if (weekStartsOn < 0 || weekStartsOn > 6) {
    throw new RangeError(
      "weekStartsOn must be between 0 (Sunday) and 6 (Saturday)"
    );
  }

  const d = dayjs(date);
  if (!d.isValid()) throw new Error("Invalid date");

  // Subtract amount * 7 days
  return d.subtract(amount * 7, "day").toDate();
}
