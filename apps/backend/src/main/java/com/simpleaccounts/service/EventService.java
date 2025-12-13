package com.simpleaccounts.service;

import com.simpleaccounts.entity.Event;
import java.util.Date;
import java.util.List;

public interface EventService {

	public List<Event> getEvents(Date startDate, Date endDate);
	
	public List<Event> getEvents();
}
