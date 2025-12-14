package com.simpleaccounts.rest.reconsilationcontroller;

import com.simpleaccounts.rest.SingleLevelDropDownModel;
import java.util.List;
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
