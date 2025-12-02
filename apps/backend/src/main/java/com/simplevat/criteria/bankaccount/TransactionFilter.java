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
import com.simplevat.entity.bankaccount.Transaction;

public class TransactionFilter extends AbstractFilter<Transaction> {

	TransactionCriteria transactionCriteria;
	
    public static final long MAX_RESULTS = 250L;

    public static final int DEFAULT_MAX_SIZE = 25;

    protected static final int START = 0;
	
	public  TransactionFilter(TransactionCriteria transactionCriteria) {
		this.transactionCriteria = transactionCriteria;
		if(transactionCriteria == null) {
			transactionCriteria = new TransactionCriteria();
		}
	}

	@Override
	protected void buildPredicates(Root<Transaction> transactionRoot, CriteriaBuilder criteriaBuilder) {
		
        if (transactionCriteria.getTransactionId() != null) {
            add(criteriaBuilder.and(criteriaBuilder.equal(transactionRoot.get("transactionId"), transactionCriteria.getTransactionId())));
        }
        if (transactionCriteria.getBankAccount() != null) {
            add(criteriaBuilder.and(criteriaBuilder.equal(transactionRoot.get("bankAccount"), transactionCriteria.getBankAccount())));
        }
        if (BooleanUtils.isTrue(transactionCriteria.getActive())) {
            add(criteriaBuilder.and(criteriaBuilder.equal(transactionRoot.get("deleteFlag"), Boolean.FALSE)));
        }
	}
	
    
    @Override
    public void addPagination(TypedQuery<Transaction> query) {
		
    	Long start = transactionCriteria.getStart();
		Long limit = transactionCriteria.getLimit();
		   
        if (query != null) {
            long newStart = (start == null || start < START) ? START : start;
            long newLimit = (limit == null || limit < 1) ? DEFAULT_MAX_SIZE : (limit > MAX_RESULTS) ? MAX_RESULTS : limit;
            query.setMaxResults((int) newLimit);
            query.setFirstResult((int) newStart);
        }
    }    
	@Override
	protected void addOrderCriteria(Root<Transaction> root, CriteriaBuilder criteriaBuilder) {
        if (transactionCriteria.getOrderBy() != null && transactionCriteria.getSortOrder() != null) {
        	addOrder(
                    addOrderCriteria(
                            criteriaBuilder,
                            root.get(transactionCriteria.getOrderBy().getColumnName()),
                            transactionCriteria.getSortOrder(),
                            transactionCriteria.getOrderBy().getColumnType()
                    )
            );
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

}
