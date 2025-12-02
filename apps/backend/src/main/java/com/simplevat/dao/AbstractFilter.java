package com.simplevat.dao;

import java.util.ArrayList;
import java.util.List;

import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.Order;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;

public abstract class AbstractFilter<ENTITY> {

	private List<Predicate> predicates;

	private List<Order> orders;

	protected void add(Predicate predicate) {
		if (predicates == null)
			predicates = new ArrayList<>();
		if (predicate != null)
			predicates.add(predicate);
	}
	
	protected void addOrder(Order order_) {
		if(orders == null ) orders = new ArrayList<>();
		if(order_!=null) orders.add(order_);
	}

	protected abstract void buildPredicates(Root<ENTITY> root, CriteriaBuilder cb);
	
	protected void addOrderCriteria(Root<ENTITY> root, CriteriaBuilder cb) {
		addOrder(null);
	}
	
	protected  void addPagination(TypedQuery<ENTITY> query) {
		
	}

	List<Predicate> getPredicates() {
		return this.predicates;
	}

	List<Order> getOrders() {
		return this.orders;
	}
}
