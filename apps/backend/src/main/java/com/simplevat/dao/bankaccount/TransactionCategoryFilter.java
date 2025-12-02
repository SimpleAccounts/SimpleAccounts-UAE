package com.simplevat.dao.bankaccount;

import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Root;

import com.simplevat.dao.AbstractFilter;
import com.simplevat.entity.bankaccount.TransactionCategory;

public class TransactionCategoryFilter extends AbstractFilter<TransactionCategory> {

	private TransactionCategory transactionCategory;
	int start;
	int limit;
	public TransactionCategoryFilter(TransactionCategory transactionCategory,int start, int limit) {
		this.transactionCategory = transactionCategory;
		this.start = start;
		this.limit = limit;
	}
	@Override
	protected void buildPredicates(Root<TransactionCategory> root, CriteriaBuilder cb) {
		add(cb.equal(root.get("deleteFlag"), transactionCategory.getDeleteFlag()));
	}
	
	@Override
	protected void addOrderCriteria(Root<TransactionCategory> root, CriteriaBuilder cb) {
		addOrder(cb.asc(root.get("transactionCategoryId")));
	}
	
	@Override
	protected  void addPagination(TypedQuery<TransactionCategory> query) {
		query.setFirstResult(this.start);
		query.setMaxResults(this.limit);
	}

}
