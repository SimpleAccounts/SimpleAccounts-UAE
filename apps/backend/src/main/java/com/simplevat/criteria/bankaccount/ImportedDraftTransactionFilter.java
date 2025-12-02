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
import com.simplevat.entity.bankaccount.ImportedDraftTransaction;

public class ImportedDraftTransactionFilter extends AbstractFilter<ImportedDraftTransaction> {

	private ImportedDraftTransactionCriteria importedDraftTransactonCriteria;
	
    public static final long MAX_RESULTS = 250L;

    public static final int DEFAULT_MAX_SIZE = 25;

    protected static final int START = 0;

	public ImportedDraftTransactionFilter(ImportedDraftTransactionCriteria criteria) {
		this.importedDraftTransactonCriteria = criteria;
		if (importedDraftTransactonCriteria == null) {
			importedDraftTransactonCriteria = new ImportedDraftTransactionCriteria();
		}
	}

	@Override
	protected void buildPredicates(Root<ImportedDraftTransaction> root, CriteriaBuilder criteriaBuilder) {

		if (importedDraftTransactonCriteria.getImportedTransactionId() != null) {
			add(criteriaBuilder.and(criteriaBuilder.equal(root.get("importedTransactionId"),
					importedDraftTransactonCriteria.getImportedTransactionId())));
		}
		if (importedDraftTransactonCriteria.getBankAccount() != null) {
			add(criteriaBuilder.and(
					criteriaBuilder.equal(root.get("bankAccount"), importedDraftTransactonCriteria.getBankAccount())));
		}
		if (BooleanUtils.isTrue(importedDraftTransactonCriteria.getActive())) {
			add(criteriaBuilder.and(criteriaBuilder.equal(root.get("deleteFlag"), Boolean.FALSE)));
		}

	}

	@Override
	protected void addOrderCriteria(Root<ImportedDraftTransaction> root, CriteriaBuilder cb) {
		if (importedDraftTransactonCriteria.getOrderBy() != null
				&& importedDraftTransactonCriteria.getSortOrder() != null) {
			addOrder(addOrderCriteria(cb, root.get(importedDraftTransactonCriteria.getOrderBy().getColumnName()),
					importedDraftTransactonCriteria.getSortOrder(),
					importedDraftTransactonCriteria.getOrderBy().getColumnType()));
		}
	}

	@Override
	protected  void addPagination(TypedQuery<ImportedDraftTransaction> query) {
		Long start = importedDraftTransactonCriteria.getStart();
		Long limit = importedDraftTransactonCriteria.getLimit();
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
