package com.simpleaccounts.service;

import com.simpleaccounts.constant.dbfilter.ProjectFilterEnum;
import com.simpleaccounts.criteria.ProjectCriteria;
import com.simpleaccounts.entity.Project;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public abstract class ProjectService extends SimpleAccountsService<Integer, Project> {

	// remove
	public abstract List<Project> getProjectsByCriteria(ProjectCriteria projectCriteria) throws Exception;

	public abstract PaginationResponseModel getProjectList(Map<ProjectFilterEnum, Object> filterMap,PaginationModel paginationModel);

	public abstract void updateProjectRevenueBudget(BigDecimal revenueAmount, Project project);

	public abstract void deleteByIds(List<Integer> ids);
        
        public abstract List<DropdownModel> getProjectsForDropdown();

}
