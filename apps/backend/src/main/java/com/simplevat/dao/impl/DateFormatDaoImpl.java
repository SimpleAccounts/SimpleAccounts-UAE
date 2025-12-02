package com.simplevat.dao.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import com.simplevat.constant.dbfilter.DateFormatFilterEnum;
import com.simplevat.constant.dbfilter.DbFilter;
import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.DateFormatDao;
import com.simplevat.entity.DateFormat;

@Repository
public class DateFormatDaoImpl extends AbstractDao<Integer, DateFormat> implements DateFormatDao {

	@Override
	public List<DateFormat> getDateFormatList(Map<DateFormatFilterEnum, Object> filterMap) {
		List<DbFilter> dbFilters = new ArrayList<>();
		filterMap.forEach(
				(productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
						.condition(productFilter.getCondition()).value(value).build()));
		return this.executeQuery(dbFilters);
	}

	@Override
	public void deleteByIds(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				DateFormat format = findByPK(id);
				format.setDeleteFlag(Boolean.TRUE);
				update(format);
			}
		}

	}

}
