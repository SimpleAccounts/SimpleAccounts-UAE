package com.simpleaccounts.service.impl;

import java.util.List;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import com.simpleaccounts.dao.ActivityDao;
import com.simpleaccounts.entity.Activity;
import com.simpleaccounts.service.ActivityService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service(value = "activityService")
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

	private final ActivityDao activityDao;

	@Override
	public List<Activity> getLatestActivites(int maxActiviyCount) {
		return activityDao.getLatestActivites( maxActiviyCount);
	}

}
