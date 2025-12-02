package com.simplevat.dao.impl;


import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

import javax.persistence.TemporalType;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.ActivityDao;
import com.simplevat.entity.Activity;
import com.simplevat.utils.ChartUtil;

@Repository(value = "activityDao")
public class ActivityDaoImpl extends AbstractDao<Integer, Activity> implements ActivityDao {
	@Autowired
	ChartUtil util;
	
	@Override
	public List<Activity> getLatestActivites(int maxActiviyCount) {
		Date startDate = util.modifyDate(new Date(), Calendar.MONTH, -1);
		List<Activity> result = getEntityManager().createNamedQuery("allActivity",
				Activity.class)
				.setParameter("startDate", startDate, TemporalType.DATE)
				.setMaxResults(maxActiviyCount)
				.getResultList();
		if(result == null) {
			return new ArrayList<>();
		}
		return result;
	}


}
