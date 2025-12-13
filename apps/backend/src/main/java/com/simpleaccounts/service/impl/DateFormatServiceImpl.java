package com.simpleaccounts.service.impl;

import java.util.List;
import lombok.RequiredArgsConstructor;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.simpleaccounts.constant.dbfilter.DateFormatFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.DateFormatDao;
import com.simpleaccounts.entity.DateFormat;
import com.simpleaccounts.service.DateFormatService;

@Service
@RequiredArgsConstructor
public class DateFormatServiceImpl extends DateFormatService {
	private final DateFormatDao dateFormatDao;

	@Override
	protected Dao<Integer, DateFormat> getDao() {
		return dateFormatDao;
	}

	@Override
	public List<DateFormat> getDateFormatList(Map<DateFormatFilterEnum, Object> filterMap) {
		return dateFormatDao.getDateFormatList(filterMap);
	}

	@Override
	public void deleteByIds(List<Integer> ids) {
		dateFormatDao.deleteByIds(ids);
	}
}
