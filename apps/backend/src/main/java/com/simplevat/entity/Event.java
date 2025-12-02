package com.simplevat.entity;

import java.util.Date;

import lombok.Data;

@Data
public class Event {

	private String title;
	private Date startDate;
	private Date endDate;
	private boolean allDay = false;
	private String styleClass;
	private Object data;
    private boolean editable = true;
    private String description;

}
