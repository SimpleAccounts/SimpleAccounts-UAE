package com.simplevat.service.impl;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simplevat.entity.Event;
import com.simplevat.service.EventService;
import com.simplevat.service.InvoiceService;

@Service("eventService")
public class EventServiceImpl implements EventService {
	
	private List<Event> events = new ArrayList<>();
	
	@Autowired
	InvoiceService invoiceService;

	@Override
	public List<Event> getEvents(Date startDate, Date endDate) {
		return events;
	}

	@Override
	public List<Event> getEvents() {
            return new ArrayList<Event>();
	}

}
