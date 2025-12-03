package com.simpleaccounts.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simpleaccounts.constant.dbfilter.DateFormatFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.DateFormatDao;
import com.simpleaccounts.entity.DateFormat;
import com.simpleaccounts.service.DateFormatService;

@Service
public class DateFormatServiceImpl extends DateFormatService {
	@Autowired
	private DateFormatDao dateFormatDao;

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
