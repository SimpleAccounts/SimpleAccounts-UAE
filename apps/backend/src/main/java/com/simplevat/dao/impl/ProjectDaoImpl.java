package com.simplevat.dao.impl;

import com.simplevat.dao.ProjectDao;
import com.simplevat.entity.Project;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.simplevat.constant.DatatableSortingFilterConstant;
import com.simplevat.constant.dbfilter.DbFilter;
import com.simplevat.constant.dbfilter.ProjectFilterEnum;
import com.simplevat.dao.AbstractDao;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.transaction.annotation.Transactional;

/**
 * Created by Utkarsh Bhavsar on 20/03/17.
 */
@Repository
public class ProjectDaoImpl extends AbstractDao<Integer, Project> implements ProjectDao {
	@Autowired
	private DatatableSortingFilterConstant dataTableUtil;

	@Override
	public PaginationResponseModel getProjectList(Map<ProjectFilterEnum, Object> filterMap,
			PaginationModel paginationModel) {
		List<DbFilter> dbFilters = new ArrayList<>();
		filterMap.forEach(
				(projectFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(projectFilter.getDbColumnName())
						.condition(projectFilter.getCondition()).value(value).build()));
		paginationModel.setSortingCol(dataTableUtil.getColName(paginationModel.getSortingCol(), DatatableSortingFilterConstant.PROJECT));
		return new PaginationResponseModel(this.getResultCount(dbFilters),
				this.executeQuery(dbFilters, paginationModel));
	}

	@Override
	public List<DropdownModel> getProjectsForDropdown() {
		return getEntityManager().createNamedQuery("projectsForDropdown", DropdownModel.class).getResultList();
	}

	@Override
	@Transactional
	public void deleteByIds(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				Project project = findByPK(id);
				project.setDeleteFlag(Boolean.TRUE);
				update(project);
			}
		}
	}

}
