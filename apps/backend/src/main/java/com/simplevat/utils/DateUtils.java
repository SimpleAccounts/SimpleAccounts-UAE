package com.simplevat.utils;

import java.text.DateFormatSymbols;
import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.Calendar;
import java.util.Date;
import java.util.TimeZone;

import org.springframework.stereotype.Component;

/**
 * @author Ankit
 *
 */
@Component
public class DateUtils {

	public static final int RELATIVE_MONTH_DAYS = 31;

	public static enum Duration {
		THIS_WEEK("Weekly"), THIS_MONTH("Monthly"), LAST_3_MONTHS("3Monthly"), LAST_6_MONTHS("6Monthly"),
		YEARLY("Yearly");

		private String duration;

		private Duration(String duration) {
			this.duration = duration;
		}

		public String getDuration() {
			return duration;
		}
	}

	/**
	 * returns the startDate using duration
	 * 
	 * @param duration
	 * @param timezone
	 * @param currentTime
	 * @return
	 * @return
	 */
	public static final Date getStartDate(DateUtils.Duration duration, TimeZone timezone, Date currentTime) {
		Calendar temp;
		temp = Calendar.getInstance(timezone);
		temp.setTime(currentTime);

		switch (duration) {

		case THIS_WEEK:
			temp.set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY);
			temp.set(Calendar.HOUR, 0);
			temp.set(Calendar.MINUTE, 0);
			temp.set(Calendar.SECOND, 0);
			temp.set(Calendar.AM_PM, Calendar.AM);
			if (temp.getTime().getTime() > currentTime.getTime())
				temp.add(Calendar.DATE, -7);
			break;

		case THIS_MONTH:
			if (temp.get(Calendar.DAY_OF_MONTH) > 1)
				temp.set(Calendar.DAY_OF_MONTH, 1);
			temp.set(Calendar.HOUR_OF_DAY, 0);
			temp.set(Calendar.MINUTE, 0);
			temp.set(Calendar.SECOND, 0);
			break;

		case LAST_3_MONTHS:
			if (temp.get(Calendar.DAY_OF_MONTH) > 1)
				temp.set(Calendar.DAY_OF_MONTH, 1);
			temp.set(Calendar.HOUR, 0);
			temp.set(Calendar.MINUTE, 0);
			temp.set(Calendar.SECOND, 0);
			temp.set(Calendar.AM_PM, Calendar.AM);
			temp.set(Calendar.MONTH, temp.get(Calendar.MONTH) - 3);
			break;

		case LAST_6_MONTHS:
			if (temp.get(Calendar.DAY_OF_MONTH) > 1)
				temp.set(Calendar.DAY_OF_MONTH, 1);
			temp.set(Calendar.HOUR, 0);
			temp.set(Calendar.MINUTE, 0);
			temp.set(Calendar.SECOND, 0);
			temp.set(Calendar.AM_PM, Calendar.AM);
			temp.set(Calendar.MONTH, temp.get(Calendar.MONTH) - 6);

			break;

		case YEARLY:
			if (temp.get(Calendar.DAY_OF_MONTH) > 1)
				temp.set(Calendar.DAY_OF_MONTH, 1);
			temp.set(Calendar.HOUR, 0);
			temp.set(Calendar.MINUTE, 0);
			temp.set(Calendar.SECOND, 0);
			temp.set(Calendar.AM_PM, Calendar.AM);
			temp.set(Calendar.MONTH, temp.get(Calendar.MONTH) - 12);
			break;
		default:
			break;
		}
		temp.set(Calendar.MILLISECOND, 0);

		return temp.getTime();
	}

	/**
	 * returns the endTime using duration
	 * 
	 * @param duration
	 * @param timezone
	 * @param currentTime
	 * @return
	 */
	public static final Date getEndDate(DateUtils.Duration duration, TimeZone timezone, Date currentTime) {
		Calendar temp;
		temp = Calendar.getInstance(timezone);

		temp.setTime(currentTime);
		switch (duration) {
		case THIS_WEEK:
			temp.set(Calendar.DAY_OF_WEEK, Calendar.SUNDAY);
			temp.set(Calendar.HOUR, 0);
			temp.set(Calendar.MINUTE, 0);
			temp.set(Calendar.SECOND, 0);
			temp.set(Calendar.AM_PM, Calendar.AM);
			if (temp.getTime().getTime() < currentTime.getTime())
				temp.add(Calendar.DATE, 7);
			break;
		case THIS_MONTH:

			int month = temp.get(Calendar.MONTH);
			temp.set(Calendar.DAY_OF_MONTH, RELATIVE_MONTH_DAYS + 1);

			// correcting the last day of the month, whether it is 30, 31, 28 or 29
			int actualDaysInMonth = RELATIVE_MONTH_DAYS - (temp.get(Calendar.DAY_OF_MONTH) - 1);

			temp.set(Calendar.MONTH, month);
			temp.set(Calendar.DAY_OF_MONTH, actualDaysInMonth);
			break;

		case LAST_3_MONTHS:
		case LAST_6_MONTHS:
		case YEARLY:
			temp.set(Calendar.MONTH, temp.get(Calendar.MONTH) - 1);

			month = temp.get(Calendar.MONTH);

			temp.set(Calendar.DAY_OF_MONTH, RELATIVE_MONTH_DAYS + 1);

			// correcting the last day of the month, whether it is 30, 31, 28 or 29
			actualDaysInMonth = RELATIVE_MONTH_DAYS - (temp.get(Calendar.DAY_OF_MONTH) - 1);

			temp.set(Calendar.MONTH, month);
			temp.set(Calendar.DAY_OF_MONTH, actualDaysInMonth);

			if (temp.get(Calendar.MONTH) == Calendar.DECEMBER)
				temp.set(Calendar.YEAR, temp.get(Calendar.YEAR) - 1);

			temp.add(Calendar.DATE, 1);
			temp.set(Calendar.HOUR, 0);
			temp.set(Calendar.MINUTE, 0);
			temp.set(Calendar.SECOND, 0);
			temp.set(Calendar.AM_PM, Calendar.AM);
			break;
		default:
			break;
		}

		temp.set(Calendar.MILLISECOND, 0);

		return temp.getTime();
	}

	/**
	 * @param num
	 * @return
	 */
	public static String getMonthForInt(int num) {
		String month = "wrong";
		DateFormatSymbols dfs = new DateFormatSymbols();
		String[] months = dfs.getShortMonths();
		if (num >= 0 && num <= 11) {
			month = months[num];
		}
		return month;
	}

	public static Date getStartDate(Date date) {
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(date);
		calendar.set(Calendar.HOUR_OF_DAY, 0);
		calendar.set(Calendar.MINUTE, 0);
		calendar.set(Calendar.SECOND, 0);
		calendar.set(Calendar.MILLISECOND, 0);
		return calendar.getTime();
	}

	public static Date getEndDate(Date date) {
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(date);
		calendar.set(Calendar.HOUR_OF_DAY, 23);
		calendar.set(Calendar.MINUTE, 59);
		calendar.set(Calendar.SECOND, 59);
		calendar.set(Calendar.MILLISECOND, 999);
		return calendar.getTime();
	}

	public LocalDateTime get(Date date) {
		return Instant.ofEpochMilli(date.getTime()).atZone(ZoneId.systemDefault()).withHour(0).withMinute(0)
				.withSecond(0).withNano(0).toLocalDateTime();
	}
	public String getLocalDateToString(Date date ,String format) {
		SimpleDateFormat dateFormatter = new SimpleDateFormat(format);
		return dateFormatter.format(date);
	}
	public Date get(LocalDateTime date) {
		return Date.from(date.atZone(ZoneId.systemDefault()).toInstant());
	}

	public LocalDateTime add(LocalDateTime date, int num) {
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(get(date));
		calendar.set(Calendar.DATE, date.getDayOfMonth() + num);
		return get(calendar.getTime());
	}

	public long getDifferenceBetweenLocalDaeTime(LocalDateTime startDate, LocalDateTime endDate) {
		LocalDateTime tempDateTime = LocalDateTime.from(startDate);
		long days = tempDateTime.until(endDate, ChronoUnit.DAYS);
		return days;
	}

	public int diff(Date startDate, Date endDate) {
		long diff = startDate.getTime() - endDate.getTime();
		int diffDays = (int) (diff / (24 * 60 * 60 * 1000));
		return diffDays;
	}
}
