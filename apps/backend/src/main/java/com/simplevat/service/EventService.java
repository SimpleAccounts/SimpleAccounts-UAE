package com.simplevat.service;

import java.util.Date;
import java.util.List;

import com.simplevat.entity.Event;

public interface EventService {

	public List<Event> getEvents(Date startDate, Date endDate);
	
	public List<Event> getEvents();
}
