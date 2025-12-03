package com.simpleaccounts.service;

import java.util.Date;
import java.util.List;

import com.simpleaccounts.entity.Event;

public interface EventService {

	public List<Event> getEvents(Date startDate, Date endDate);
	
	public List<Event> getEvents();
}
