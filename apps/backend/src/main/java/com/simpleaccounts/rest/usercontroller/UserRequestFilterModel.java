package com.simpleaccounts.rest.usercontroller;

import com.simpleaccounts.rest.PaginationModel;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class UserRequestFilterModel extends PaginationModel{

	private String name;
	private String dob;
	private Integer roleId;
	private Integer active;
	private Integer companyId;
	//company to discussed
	
}
