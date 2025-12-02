package com.simplevat.rest.reconsilationcontroller;

import java.util.List;

import com.simplevat.rest.SingleLevelDropDownModel;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ReconsilationCatDataModel {

	private List<Object> dataList;
	private List<SingleLevelDropDownModel> categoriesList;
}
