package com.simplevat.rest.journalcontroller;

import com.simplevat.rest.PaginationModel;
import lombok.Data;

@Data
public class JournalRequestFilterModel extends PaginationModel {

	private String journalDate;
	private String journalReferenceNo;
	private String description;
}
