package com.simplevat.criteria;

import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Order;
import javax.persistence.criteria.Path;
import javax.persistence.criteria.Root;

import org.apache.commons.lang3.BooleanUtils;

import com.simplevat.criteria.bankaccount.TransactionCategoryCriteria;
import com.simplevat.dao.AbstractFilter;
import com.simplevat.entity.bankaccount.TransactionCategory;

public class TransactionCategoryFilterNew extends AbstractFilter<TransactionCategory> {
	
    public static final long MAX_RESULTS = 250L;

    public static final int DEFAULT_MAX_SIZE = 25;

    protected static final int START = 0;

	private TransactionCategoryCriteria transactionCategoryCriteria;
	
	public TransactionCategoryFilterNew(TransactionCategoryCriteria criteria) {
		this.transactionCategoryCriteria = criteria;
	}
	@Override
	protected void buildPredicates(Root<TransactionCategory> root, CriteriaBuilder criteriaBuilder) {
		
        if (transactionCategoryCriteria.getTransactionCategoryId() != null) {
            add(criteriaBuilder.and(criteriaBuilder.equal(root.get("transactionCategoryId"), transactionCategoryCriteria.getTransactionCategoryId())));
        }
        if (BooleanUtils.isTrue(transactionCategoryCriteria.getActive())) {
            add(criteriaBuilder.and(criteriaBuilder.equal(root.get("deleteFlag"), Boolean.FALSE)));
            
        }
		
	}
	
    @Override
    protected void addOrderCriteria(Root<TransactionCategory> root, CriteriaBuilder criteriaBuilder) {
		if (transactionCategoryCriteria.getOrderBy() != null && transactionCategoryCriteria.getSortOrder() != null) {

			addOrder(addOrderCriteria(criteriaBuilder, root.get(transactionCategoryCriteria.getOrderBy().getColumnName()),
					transactionCategoryCriteria.getSortOrder(), transactionCategoryCriteria.getOrderBy().getColumnType()));
		}
    }
    
    private Order addOrderCriteria(CriteriaBuilder criteriaBuilder, Path path, SortOrder sortOrder, AbstractCriteria.OrderByType orderByType) {
        Order order;
        if (SortOrder.DESC.equals(sortOrder)) {
            order = AbstractCriteria.OrderByType.NUMBER.equals(orderByType)
                    ? criteriaBuilder.desc(path)
                    : criteriaBuilder.desc(criteriaBuilder.lower(path));
        } else {
            order = AbstractCriteria.OrderByType.NUMBER.equals(orderByType)
                    ? criteriaBuilder.asc(path)
                    : criteriaBuilder.asc(criteriaBuilder.lower(path));
        }
        return order;
    }
    
	@Override
	protected  void addPagination(TypedQuery<TransactionCategory> query) {
		   Long start = transactionCategoryCriteria.getStart();
		   Long limit = transactionCategoryCriteria.getLimit();
		   if (query != null) {
	            long newStart = (start == null || start < START) ? START : start;
	            long newLimit = (limit == null || limit < 1) ? DEFAULT_MAX_SIZE : (limit > MAX_RESULTS) ? MAX_RESULTS : limit;
	            query.setMaxResults((int) newLimit);
	            query.setFirstResult((int) newStart);
	        }
	}

}
