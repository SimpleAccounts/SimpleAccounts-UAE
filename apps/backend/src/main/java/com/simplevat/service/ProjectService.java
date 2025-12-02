package com.simplevat.service;

import com.simplevat.constant.dbfilter.ProjectFilterEnum;
import com.simplevat.criteria.ProjectCriteria;
import com.simplevat.entity.Project;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

import java.math.BigDecimal;

import java.util.List;
import java.util.Map;

public abstract class ProjectService extends SimpleVatService<Integer, Project> {

	// remove
	public abstract List<Project> getProjectsByCriteria(ProjectCriteria projectCriteria) throws Exception;

	public abstract PaginationResponseModel getProjectList(Map<ProjectFilterEnum, Object> filterMap,PaginationModel paginationModel);


	public abstract void updateProjectRevenueBudget(BigDecimal revenueAmount, Project project);

	public abstract void deleteByIds(List<Integer> ids);
        
        public abstract List<DropdownModel> getProjectsForDropdown();

}
