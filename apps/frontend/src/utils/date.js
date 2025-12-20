import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isoWeek from 'dayjs/plugin/isoWeek';
import duration from 'dayjs/plugin/duration';

// Extend dayjs with plugins
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(duration);

/**
 * Day.js utility wrapper
 *
 * This module provides a configured Day.js instance with all required plugins
 * for replacing Moment.js throughout the application.
 *
 * Usage:
 *   import dayjs from '@/utils/date';
 *   dayjs().format('YYYY-MM-DD');
 *   dayjs(date).fromNow();
 *
 * Available plugins:
 * - customParseFormat: Parse dates with format strings (dayjs(date, format))
 * - relativeTime: Relative time formatting (.fromNow())
 * - utc: UTC timezone handling
 * - timezone: Timezone conversions
 * - isBetween: Date range checks
 * - isSameOrBefore: Comparison operations
 * - isSameOrAfter: Comparison operations
 * - weekOfYear: Week calculations
 * - isoWeek: ISO week calculations
 * - duration: Duration calculations
 *
 * API Compatibility:
 * Most Moment.js APIs are compatible with Day.js:
 * - dayjs() - Create date instance
 * - dayjs(date) - Parse date
 * - dayjs(date, format) - Parse with format (requires customParseFormat)
 * - .format(pattern) - Format date
 * - .fromNow() - Relative time (requires relativeTime)
 * - .add(value, unit) - Add time
 * - .subtract(value, unit) - Subtract time
 * - .diff(date, unit) - Calculate difference
 * - .isBefore(date) - Check if before
 * - .isAfter(date) - Check if after
 * - .isSame(date, unit) - Check if same
 * - .startOf(unit) - Start of period
 * - .endOf(unit) - End of period
 * - .clone() - Clone instance
 * - .isValid() - Check validity
 *
 * @module utils/date
 * @see https://day.js.org/ for full documentation
 */
export default dayjs;
