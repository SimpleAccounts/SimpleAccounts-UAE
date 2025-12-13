package com.simpleaccounts.service;

import com.simpleaccounts.constant.dbfilter.DateFormatFilterEnum;
import com.simpleaccounts.entity.DateFormat;
import java.util.List;
import java.util.Map;

public abstract class DateFormatService extends SimpleAccountsService<Integer, DateFormat> {

	public abstract List<DateFormat> getDateFormatList(Map<DateFormatFilterEnum, Object> filterMap);

	public abstract void deleteByIds(List<Integer> ids);

}
