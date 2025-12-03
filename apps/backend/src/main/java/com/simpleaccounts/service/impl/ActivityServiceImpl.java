package com.simpleaccounts.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simpleaccounts.dao.ActivityDao;
import com.simpleaccounts.entity.Activity;
import com.simpleaccounts.service.ActivityService;

@Service(value = "activityService")
public class ActivityServiceImpl implements ActivityService {

	@Autowired
	private ActivityDao activityDao;

	@Override
	public List<Activity> getLatestActivites(int maxActiviyCount) {
		return activityDao.getLatestActivites( maxActiviyCount);
	}



}
