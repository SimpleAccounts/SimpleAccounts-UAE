package com.simplevat.criteria.bankaccount;

import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Order;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.BooleanUtils;

import com.simplevat.criteria.AbstractCriteria;
import com.simplevat.criteria.SortOrder;
import com.simplevat.dao.AbstractFilter;
import com.simplevat.entity.bankaccount.ChartOfAccount;

public class ChartOfAccountFilter extends AbstractFilter<ChartOfAccount> {

	private ChartOfAccountCriteria chartOfAccountCriteria;

	public static final long MAX_RESULTS = 250L;

	public static final int DEFAULT_MAX_SIZE = 25;

	protected static final int START = 0;

	public ChartOfAccountFilter(ChartOfAccountCriteria chartOfAccountCriteria) {
		this.chartOfAccountCriteria = chartOfAccountCriteria;
		if (chartOfAccountCriteria == null) {
			chartOfAccountCriteria = new ChartOfAccountCriteria();
		}
	}

	@Override
	protected void buildPredicates(Root<ChartOfAccount> chartOfAccountRoot, CriteriaBuilder criteriaBuilder) {
		if (chartOfAccountCriteria.getChartOfAccountId() != null) {
			add(criteriaBuilder.and(criteriaBuilder.equal(chartOfAccountRoot.get("chartOfAccountId"),
					chartOfAccountCriteria.getChartOfAccountId())));
		}

		if (BooleanUtils.isTrue(chartOfAccountCriteria.getActive())) {
			add(criteriaBuilder.and(criteriaBuilder.equal(chartOfAccountRoot.get("deleteFlag"), Boolean.FALSE)));
		}

	}

	@Override
	public void addOrderCriteria(Root<ChartOfAccount> chartOfAccountRoot, CriteriaBuilder criteriaBuilder) {
		if (chartOfAccountCriteria.getOrderBy() != null && chartOfAccountCriteria.getSortOrder() != null) {
			addOrder(addOrderCriteria(criteriaBuilder,
					chartOfAccountRoot.get(chartOfAccountCriteria.getOrderBy().getColumnName()),
					chartOfAccountCriteria.getSortOrder(), chartOfAccountCriteria.getOrderBy().getColumnType()));
		}
	}

	@Override
	public void addPagination(TypedQuery<ChartOfAccount> query) {
		Long start = chartOfAccountCriteria.getStart();
		Long limit = chartOfAccountCriteria.getLimit();
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
