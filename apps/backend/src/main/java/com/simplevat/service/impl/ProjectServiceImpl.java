package com.simplevat.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.simplevat.constant.dbfilter.ProjectFilterEnum;
import com.simplevat.criteria.ProjectCriteria;
import com.simplevat.criteria.ProjectFilter;
import com.simplevat.dao.Dao;
import com.simplevat.dao.ProjectDao;
import com.simplevat.entity.Project;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.ProjectService;
import java.math.BigDecimal;

/**
 * Created by Utkarsh Bhavsar on 21/03/17.
 */
@Service("projectService")
public class ProjectServiceImpl extends ProjectService {

    @Autowired
    private ProjectDao projectDao;

    @Override
    @Transactional(readOnly = true)
    public List<Project> getProjectsByCriteria(ProjectCriteria projectCriteria) throws Exception {
        ProjectFilter filter = new ProjectFilter(projectCriteria);
        return getDao().filter(filter);
    }

    @Override
    public Dao<Integer, Project> getDao() {
        return projectDao;
    }

    @Override
    public void updateProjectRevenueBudget(BigDecimal revenueAmount, Project project) {
        if (project.getRevenueBudget()!= null) {
            project.setRevenueBudget(project.getRevenueBudget().add(revenueAmount));
        } else {
            project.setRevenueBudget(revenueAmount);
        }
        update(project);
    }

    @Override
    public List<DropdownModel> getProjectsForDropdown() {
        return this.projectDao.getProjectsForDropdown();
    }

    @Override
    public void deleteByIds(List<Integer> ids) {
        projectDao.deleteByIds(ids);
    }

    @Override
    public PaginationResponseModel getProjectList(Map<ProjectFilterEnum, Object> filterMap,PaginationModel paginationModel) {
        return projectDao.getProjectList(filterMap,paginationModel);
    }
}
