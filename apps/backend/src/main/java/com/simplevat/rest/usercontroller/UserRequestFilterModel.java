package com.simplevat.rest.usercontroller;

import com.simplevat.rest.PaginationModel;

import lombok.Data;

@Data
public class UserRequestFilterModel extends PaginationModel{

	private String name;
	private String dob;
	private Integer roleId;
	private Integer active;
	private Integer companyId;
	//company to discussed
	
}
