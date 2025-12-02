package com.simplevat.rest.dateformatcontroller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.simplevat.entity.DateFormat;
import com.simplevat.service.DateFormatService;

@Component
public class DateFormatRestHelper {

	@Autowired
	private DateFormatService dateFormatService;

	public List<DateFormatListModel> getModelList(List<DateFormat> dateFormatList) {
		List<DateFormatListModel> modelList = new ArrayList<>();
		if (dateFormatList != null && !dateFormatList.isEmpty()) {
			for (DateFormat dateFormat : dateFormatList) {
				DateFormatListModel dateFormatModel = new DateFormatListModel();
				dateFormatModel.setId(dateFormat.getId());
				dateFormatModel.setFormat(dateFormat.getFormat());
				modelList.add(dateFormatModel);
			}
		}
		return modelList;
	}

	public DateFormatResponseModel getModel(DateFormat dateFormat) {
		DateFormatResponseModel dateFormatModel = new DateFormatResponseModel();
		dateFormatModel.setId(dateFormat.getId());
		dateFormatModel.setFormat(dateFormat.getFormat());
		return dateFormatModel;
	}

	public DateFormat getEntity(DateFormatRequestModel requestModel) {
		DateFormat dateFormat = new DateFormat();
		if (dateFormat.getId() != null) {
			dateFormat = dateFormatService.findByPK(requestModel.getId());
		}
		dateFormat.setFormat(requestModel.getFormat());

		return dateFormat;
	}
}
