package com.simplevat.rest.projectcontroller;

import com.simplevat.rest.PaginationModel;

import lombok.Data;

@Data
public class ProjectRequestFilterModel extends PaginationModel{

	private Integer projectId;
	private String projectName;
        private Integer vatRegistrationNumber;
        private Integer expenseBudget;
        private Integer revenueBudget;
	private Integer userId;
	private boolean deleteFlag;

}
