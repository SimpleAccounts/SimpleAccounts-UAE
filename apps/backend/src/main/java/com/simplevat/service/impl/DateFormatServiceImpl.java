package com.simplevat.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simplevat.constant.dbfilter.DateFormatFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.dao.DateFormatDao;
import com.simplevat.entity.DateFormat;
import com.simplevat.service.DateFormatService;

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
