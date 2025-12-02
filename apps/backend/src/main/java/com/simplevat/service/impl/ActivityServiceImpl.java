package com.simplevat.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simplevat.dao.ActivityDao;
import com.simplevat.entity.Activity;
import com.simplevat.service.ActivityService;

@Service(value = "activityService")
public class ActivityServiceImpl implements ActivityService {

	@Autowired
	private ActivityDao activityDao;

	@Override
	public List<Activity> getLatestActivites(int maxActiviyCount) {
		return activityDao.getLatestActivites( maxActiviyCount);
	}



}
