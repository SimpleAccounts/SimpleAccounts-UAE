package com.simpleaccounts.rest.vatcontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class VatCategoryRequestFilterModel extends PaginationModel{

	private String name;
	private String vatPercentage;

}
