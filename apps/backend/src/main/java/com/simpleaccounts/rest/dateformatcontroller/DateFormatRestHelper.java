package com.simpleaccounts.rest.dateformatcontroller;

import java.util.ArrayList;
import lombok.RequiredArgsConstructor;
import java.util.List;

import org.springframework.stereotype.Component;

import com.simpleaccounts.entity.DateFormat;
import com.simpleaccounts.service.DateFormatService;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DateFormatRestHelper {

	private final DateFormatService dateFormatService;

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
