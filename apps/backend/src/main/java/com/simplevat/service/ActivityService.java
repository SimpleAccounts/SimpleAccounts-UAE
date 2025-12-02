package com.simplevat.service;

import java.util.List;

import com.simplevat.entity.Activity;

public interface  ActivityService {
	
	  public List<Activity>  getLatestActivites(int maxActiviyCount);
}
