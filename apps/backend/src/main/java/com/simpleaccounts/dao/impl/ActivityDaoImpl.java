package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.ActivityDao;
import com.simpleaccounts.entity.Activity;
import com.simpleaccounts.utils.ChartUtil;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.Date;
import java.util.List;
import javax.persistence.TemporalType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository(value = "activityDao")
@RequiredArgsConstructor
public class ActivityDaoImpl extends AbstractDao<Integer, Activity> implements ActivityDao {
	private final ChartUtil util;
	
	@Override
	public List<Activity> getLatestActivites(int maxActiviyCount) {
		Date startDate = util.modifyDate(new Date(), Calendar.MONTH, -1);
		List<Activity> result = getEntityManager().createNamedQuery("allActivity",
				Activity.class)
				.setParameter(CommonColumnConstants.START_DATE, startDate, TemporalType.DATE)
				.setMaxResults(maxActiviyCount)
				.getResultList();
		if(result == null) {
			return new ArrayList<>();
		}
		return result;
	}

}
