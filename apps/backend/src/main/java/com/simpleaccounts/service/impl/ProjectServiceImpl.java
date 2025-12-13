package com.simpleaccounts.service.impl;

import com.simpleaccounts.constant.dbfilter.ProjectFilterEnum;
import com.simpleaccounts.criteria.ProjectCriteria;
import com.simpleaccounts.criteria.ProjectFilter;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.ProjectDao;
import com.simpleaccounts.entity.Project;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.ProjectService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Created by Utkarsh Bhavsar on 21/03/17.
 */
@Service("projectService")
@RequiredArgsConstructor
public class ProjectServiceImpl extends ProjectService {

    private final ProjectDao projectDao;

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
