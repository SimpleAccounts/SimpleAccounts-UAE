package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.ProjectDao;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.entity.Project;

import org.springframework.stereotype.Repository;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.ProjectFilterEnum;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.ProjectDao;
import com.simpleaccounts.entity.Project;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 * Created by Utkarsh Bhavsar on 20/03/17.
 */
@Repository
@RequiredArgsConstructor
public class ProjectDaoImpl extends AbstractDao<Integer, Project> implements ProjectDao {
	private final DatatableSortingFilterConstant dataTableUtil;

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
