package com.simplevat.service;

import java.util.List;
import java.util.Map;

import com.simplevat.constant.dbfilter.DateFormatFilterEnum;
import com.simplevat.entity.DateFormat;

public abstract class DateFormatService extends SimpleVatService<Integer, DateFormat> {

	public abstract List<DateFormat> getDateFormatList(Map<DateFormatFilterEnum, Object> filterMap);

	public abstract void deleteByIds(List<Integer> ids);

}
