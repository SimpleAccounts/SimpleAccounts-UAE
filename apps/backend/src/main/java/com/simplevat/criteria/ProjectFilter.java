package com.simplevat.criteria;

import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Order;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.BooleanUtils;

import com.simplevat.dao.AbstractFilter;
import com.simplevat.entity.Project;

public class ProjectFilter extends AbstractFilter<Project> {

	private ProjectCriteria projectCriteria;
	
    public static final long MAX_RESULTS = 250L;

    public static final int DEFAULT_MAX_SIZE = 25;

    protected static final int START = 0;

	public ProjectFilter(ProjectCriteria projectCriteria) {
		this.projectCriteria = projectCriteria;
	}

	@Override
	protected void buildPredicates(Root<Project> root, CriteriaBuilder criteriaBuilder) {

		if (projectCriteria == null) {
			projectCriteria = new ProjectCriteria();
		}

		if (projectCriteria.getProjectId() != null) {
			add(criteriaBuilder.and(criteriaBuilder.equal(root.get("projectId"), projectCriteria.getProjectId())));
		}
		if (projectCriteria.getProjectName() != null) {
			add(criteriaBuilder.and(criteriaBuilder.like(criteriaBuilder.upper(root.get("projectName")),
					"%" + projectCriteria.getProjectName().toUpperCase() + "%")));
		}
		if (BooleanUtils.isTrue(projectCriteria.getActive())) {
			add(criteriaBuilder.and(criteriaBuilder.equal(root.get("deleteFlag"), !projectCriteria.getActive())));
		}
	}

	@Override
	protected void addOrderCriteria(Root<Project> root, CriteriaBuilder criteriaBuilder) {
		if (projectCriteria.getOrderBy() != null && projectCriteria.getSortOrder() != null) {

			addOrder(addOrderCriteria(criteriaBuilder, root.get(projectCriteria.getOrderBy().getColumnName()),
					projectCriteria.getSortOrder(), projectCriteria.getOrderBy().getColumnType()));
		}
	}

	@Override
	protected  void addPagination(TypedQuery<Project> query) {
		   Long start = projectCriteria.getStart();
		   Long limit = projectCriteria.getLimit();
		   if (query != null) {
	            long newStart = (start == null || start < START) ? START : start;
	            long newLimit = (limit == null || limit < 1) ? DEFAULT_MAX_SIZE : (limit > MAX_RESULTS) ? MAX_RESULTS : limit;
	            query.setMaxResults((int) newLimit);
	            query.setFirstResult((int) newStart);
	        }
	}
	private Order addOrderCriteria(CriteriaBuilder criteriaBuilder, Path path, SortOrder sortOrder,
			AbstractCriteria.OrderByType orderByType) {
		Order order;
		if (SortOrder.DESC.equals(sortOrder)) {
			order = AbstractCriteria.OrderByType.NUMBER.equals(orderByType) ? criteriaBuilder.desc(path)
					: criteriaBuilder.desc(criteriaBuilder.lower(path));
		} else {
			order = AbstractCriteria.OrderByType.NUMBER.equals(orderByType) ? criteriaBuilder.asc(path)
					: criteriaBuilder.asc(criteriaBuilder.lower(path));
		}
		return order;
	}

}
