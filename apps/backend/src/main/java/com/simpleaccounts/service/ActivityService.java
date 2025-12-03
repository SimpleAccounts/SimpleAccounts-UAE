package com.simpleaccounts.service;

import java.util.List;

import com.simpleaccounts.entity.Activity;

public interface  ActivityService {
	
	  public List<Activity>  getLatestActivites(int maxActiviyCount);
}
