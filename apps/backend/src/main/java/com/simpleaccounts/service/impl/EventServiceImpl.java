package com.simpleaccounts.service.impl;

import com.simpleaccounts.entity.Event;
import com.simpleaccounts.service.EventService;
import com.simpleaccounts.service.InvoiceService;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("eventService")
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {
	
	private List<Event> events = new ArrayList<>();
	
	private final InvoiceService invoiceService;

	@Override
	public List<Event> getEvents(Date startDate, Date endDate) {
		return events;
	}

	@Override
	public List<Event> getEvents() {
            return new ArrayList<Event>();
	}

}
