import {
  getTimePairs,
  decimal2HoursMinutes,
  getPerDayRemarks,
} from './date-manipulation.js';
import { timeSheet2Excel } from './excel-output.js';

// constants

const DECIMAL_PRECISION = 6;

const DEFAULT_WORKED_HOURS = '';

const DAY_LABEL = 'Tag';

// functions

const MONTH_LABELS = year =>
  [
    'Januar',
    'Februar',
    'März',
    'April',
    'Mai',
    'Juni',
    'Juli',
    'August',
    'September',
    'Oktober',
    'November',
    'Dezember',
  ].map(month => ({
    title: `${month} ${year}`,
  }));

const WITH_REMARKS = months => {
  const output = [];
  for (let i = 0, n = months.length; i < n; i++) {
    output.push(months[i]);
    output.push({ title: 'Bemerkungen' });
  }
  return output;
};

const timeEntry = (isDecimalFormat, totalWorkedHoursForDate) =>
  isDecimalFormat
    ? totalWorkedHoursForDate.toFixed(DECIMAL_PRECISION)
    : decimal2HoursMinutes(totalWorkedHoursForDate);

export const export2Excel = (isDecimalFormat, currentYear) => async _event => {
  // Excel format is this:
  // - each *row* denotes a certain day in any month
  // - within each row we start from the past year and roll over into the current year
  // - within each year we enumerate the months from January..December.

  // init model
  currentYear =
    typeof currentYear === 'number'
      ? currentYear | 0
      : new Date().getFullYear();

  const lastYear = currentYear - 1;

  // fill header title columns with 'Day' and 2 x all 12 months (for last and current year)
  const header = [
    { title: DAY_LABEL },
    ...WITH_REMARKS(MONTH_LABELS(lastYear)),
    ...WITH_REMARKS(MONTH_LABELS(currentYear)),
  ];

  // initialize rows with numeric day numbers 1..31 in first cell of each row, respectively
  const rows = Array(31)
    .fill(undefined)
    .map((_, numericDay) => [`<b>${numericDay + 1}</b>`]);

  // for all days (0-based), in increasing row-order (i.e. top-to-bottom):
  for (let day = 0; day < 31; day++) {
    // for all years from last to current year:
    for (let year = lastYear; year <= currentYear; year++) {
      // for all month (0-based):
      for (let month = 0; month < 12; month++) {
        // try to get non-empty time pairs for that date from indexedDB
        const timePairs = await getTimePairs(
          'time-pairs-only',
          year,
          month,
          day + 1 /* time-pair keys are 1-based */
        );
        if (!timePairs.length) {
          // no entries for that date -
          // enter a default-worked-hours cell value
          rows[day].push(DEFAULT_WORKED_HOURS);
        } else {
          // calculate total worked time value
          const totalWorkedHoursForDate = timePairs
            .map(([startTime, endTime]) => endTime - startTime)
            .reduce((timeRange1, timeRange2) => timeRange1 + timeRange2, 0);

          // enter it into appropriate cell
          rows[day].push(timeEntry(isDecimalFormat, totalWorkedHoursForDate));
        }
        // insert remarks for that day (default: empty string)
        rows[day].push(await getPerDayRemarks(year, month, day + 1));
      }
    }
  }

  // convert filled model to Excel format
  await timeSheet2Excel({ header, rows });
};
