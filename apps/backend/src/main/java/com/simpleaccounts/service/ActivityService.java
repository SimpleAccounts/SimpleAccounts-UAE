package com.simpleaccounts.service;

import com.simpleaccounts.entity.Activity;
import java.util.List;

public interface  ActivityService {
	
	  public List<Activity>  getLatestActivites(int maxActiviyCount);
}
