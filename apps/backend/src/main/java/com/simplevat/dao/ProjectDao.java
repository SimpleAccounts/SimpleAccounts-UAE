package com.simplevat.dao;

import com.simplevat.constant.dbfilter.ProjectFilterEnum;
import com.simplevat.entity.Project;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

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
