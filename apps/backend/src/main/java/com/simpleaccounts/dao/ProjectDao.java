package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.ProjectFilterEnum;
import com.simpleaccounts.entity.Project;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

/**
 * Created by Utkarsh Bhavsar on 20/03/17.
 */
public interface ProjectDao extends Dao<Integer, Project> {

    public void deleteByIds(List<Integer> ids);

    public PaginationResponseModel getProjectList(Map<ProjectFilterEnum, Object> filterMap,PaginationModel paginationModel);

    public List<DropdownModel> getProjectsForDropdown();
}
