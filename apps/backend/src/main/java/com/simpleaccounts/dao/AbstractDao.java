package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.ORDERBYENUM;
import com.simpleaccounts.rest.PaginationModel;

import lombok.extern.slf4j.Slf4j;

import java.lang.reflect.ParameterizedType;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.persistence.EntityManager;
import javax.persistence.EntityManagerFactory;
import javax.persistence.EntityTransaction;
import javax.persistence.FlushModeType;
import javax.persistence.PersistenceContext;
import javax.persistence.PersistenceUnit;
import javax.persistence.TypedQuery;
import javax.persistence.criteria.CriteriaBuilder;
import javax.persistence.criteria.CriteriaQuery;
import javax.persistence.criteria.Order;
import javax.persistence.criteria.Predicate;
import javax.persistence.criteria.Root;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;

@Slf4j
public abstract class AbstractDao<PK, ENTITY> implements Dao<PK, ENTITY> {

	private static final String AND_CLAUSE = " and ";
	private static final String WHERE_CLAUSE = " where ";

	protected Class<ENTITY> entityClass;

	@PersistenceContext
	private EntityManager entityManager;

	@PersistenceUnit
	private EntityManagerFactory emf;

	@SuppressWarnings("unchecked")
	protected AbstractDao() {
		ParameterizedType genericSuperclass = (ParameterizedType) getClass().getGenericSuperclass();
		this.entityClass = (Class<ENTITY>) genericSuperclass.getActualTypeArguments()[1];
	}

	@Override
	public ENTITY findByPK(PK pk) {
		return entityManager.find(entityClass, pk);
	}

	@Override
	public List<ENTITY> executeNamedQuery(String namedQuery) {
		return entityManager.createNamedQuery(namedQuery, entityClass).getResultList();
	}

	@Override
	public List<ENTITY> executeQuery(List<DbFilter> dbFilters) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<ENTITY> cq = cb.createQuery(entityClass);
		Root<ENTITY> root = cq.from(entityClass);

		List<Predicate> predicates = buildPredicates(dbFilters, root, cb);
		if (!predicates.isEmpty()) {
			cq.where(predicates.toArray(new Predicate[0]));
		}

		TypedQuery<ENTITY> typedQuery = entityManager.createQuery(cq);
		return typedQuery.getResultList();
	}

	@Override
	public List<ENTITY> executeQuery(List<DbFilter> dbFilters, PaginationModel paginationModel) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<ENTITY> cq = cb.createQuery(entityClass);
		Root<ENTITY> root = cq.from(entityClass);

		List<Predicate> predicates = buildPredicates(dbFilters, root, cb);
		if (!predicates.isEmpty()) {
			cq.where(predicates.toArray(new Predicate[0]));
		}

		// Add sorting
		List<Order> orders = buildOrders(dbFilters, root, cb, paginationModel);
		if (!orders.isEmpty()) {
			cq.orderBy(orders);
		}

		TypedQuery<ENTITY> typedQuery = entityManager.createQuery(cq);

		if (paginationModel != null && !paginationModel.isPaginationDisable()) {
			typedQuery.setFirstResult(paginationModel.getPageNo());
			typedQuery.setMaxResults(paginationModel.getPageSize());
		}

		return typedQuery.getResultList();
	}

	@Override
	public Integer getResultCount(List<DbFilter> dbFilters) {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<Long> cq = cb.createQuery(Long.class);
		Root<ENTITY> root = cq.from(entityClass);
		cq.select(cb.count(root)); // Select count for result size

		List<Predicate> predicates = buildPredicates(dbFilters, root, cb);
		if (!predicates.isEmpty()) {
			cq.where(predicates.toArray(new Predicate[0]));
		}

		TypedQuery<Long> typedQuery = entityManager.createQuery(cq);
		return typedQuery.getSingleResult().intValue();
	}

	private List<Predicate> buildPredicates(List<DbFilter> dbFilters, Root<ENTITY> root, CriteriaBuilder cb) {
		List<Predicate> predicates = new ArrayList<>();
		for (DbFilter dbFilter : dbFilters) {
			if (dbFilter.getValue() != null && !dbFilter.getValue().toString().isEmpty()) {
				String condition = dbFilter.getCondition().trim().toLowerCase();
				// Handle typical JPQL conditions containing parameter placeholders
				if (condition.startsWith("=")) {
					predicates.add(cb.equal(root.get(dbFilter.getDbCoulmnName()), dbFilter.getValue()));
				} else if (condition.contains("like")) {
					predicates.add(cb.like(root.get(dbFilter.getDbCoulmnName()), "%" + dbFilter.getValue() + "%"));
				} else if (condition.startsWith(">=")) {
					predicates.add(cb.greaterThanOrEqualTo(root.get(dbFilter.getDbCoulmnName()), (Comparable) dbFilter.getValue()));
				} else if (condition.startsWith("<=")) {
					predicates.add(cb.lessThanOrEqualTo(root.get(dbFilter.getDbCoulmnName()), (Comparable) dbFilter.getValue()));
				} else if (condition.startsWith(">")) {
					predicates.add(cb.greaterThan(root.get(dbFilter.getDbCoulmnName()), (Comparable) dbFilter.getValue()));
				} else if (condition.startsWith("<")) {
					predicates.add(cb.lessThan(root.get(dbFilter.getDbCoulmnName()), (Comparable) dbFilter.getValue()));
				} else {
					log.warn("Unsupported condition: {}", dbFilter.getCondition());
				}
			}
		}
		return predicates;
	}

	private List<Order> buildOrders(List<DbFilter> dbFilters, Root<ENTITY> root, CriteriaBuilder cb, PaginationModel paginationModel) {
		List<Order> orders = new ArrayList<>();

		// Process orderBy from dbFilters if present
		for (DbFilter dbFilter : dbFilters) {
			if (isOrderBy(dbFilter)) {
				if (dbFilter.getValue().toString().equalsIgnoreCase(ORDERBYENUM.ASC.toString())) {
					orders.add(cb.asc(root.get(dbFilter.getDbCoulmnName())));
				} else if (dbFilter.getValue().toString().equalsIgnoreCase(ORDERBYENUM.DESC.toString())) {
					orders.add(cb.desc(root.get(dbFilter.getDbCoulmnName())));
				}
			}
		}
		
		// Also consider paginationModel's sortingCol and order
		if (paginationModel != null && paginationModel.getSortingCol() != null
				&& !paginationModel.getSortingCol().isEmpty() && !paginationModel.getSortingCol().contains(" ") && !paginationModel.getSortingCol().contains("-1")) {
			if (paginationModel.getOrder().equalsIgnoreCase(ORDERBYENUM.ASC.toString())) {
				orders.add(cb.asc(root.get(paginationModel.getSortingCol())));
			} else if (paginationModel.getOrder().equalsIgnoreCase(ORDERBYENUM.DESC.toString())) {
				orders.add(cb.desc(root.get(paginationModel.getSortingCol())));
			}
		}
		return orders;
	}


	@Override
	public ENTITY persist(ENTITY entity) {
		entityManager.persist(entity);
		entityManager.flush();
		entityManager.refresh(entity);
		return entity;
	}

	@Override
	public ENTITY update(ENTITY entity) {
		return entityManager.merge(entity);
	}

	@Override
	public void delete(ENTITY entity) {
		entityManager.remove(entityManager.contains(entity) ? entity : entityManager.merge(entity));
	}

	@Override
	public EntityManager getEntityManager() {
		return this.entityManager;
	}

	@Override
	public List<ENTITY> findByAttributes(Map<String, Object> attributes) {
		List<ENTITY> results;
		// set up the Criteria query
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<ENTITY> cq = cb.createQuery(entityClass);
		Root<ENTITY> foo = cq.from(entityClass);

		List<Predicate> predicates = new ArrayList<>();
		for (String s : attributes.keySet()) {
			if (foo.get(s) != null) {
				if (attributes.get(s) instanceof String)
					predicates.add(cb.like(foo.get(s), "%" + attributes.get(s) + "%"));

				if (!(attributes.get(s) instanceof String))
					predicates.add(cb.equal(foo.get(s), attributes.get(s)));
			}
		}
		cq.where(predicates.toArray(new Predicate[] {}));
		TypedQuery<ENTITY> q = entityManager.createQuery(cq);

		results = q.getResultList();
		return results;
	}

	@Override
	public List<ENTITY> filter(AbstractFilter<ENTITY> filter) {
		CriteriaBuilder cb = getEntityManager().getCriteriaBuilder();
		CriteriaQuery<ENTITY> criteriaQuery = cb.createQuery(entityClass);
		Root<ENTITY> root = criteriaQuery.from(entityClass);
		filter.buildPredicates(root, cb);
		filter.addOrderCriteria(root, cb);
		List<Predicate> predicates = filter.getPredicates();
		if (predicates != null && !predicates.isEmpty()) {
			criteriaQuery.where(predicates.toArray(new Predicate[predicates.size()]));
		}
		List<Order> orders = filter.getOrders();
		if (orders != null && !orders.isEmpty()) {
			criteriaQuery.orderBy(orders);
		}
		TypedQuery<ENTITY> query = getEntityManager().createQuery(criteriaQuery);
		filter.addPagination(query);
		return query.getResultList();

	}

	@Override
	public void importData(List<ENTITY> entities) {
		EntityManager entityManager = emf.createEntityManager();
		entityManager.setFlushMode(FlushModeType.COMMIT);
		EntityTransaction transaction = null;
		int entityCount = entities.size();
		int batchSize = 10;
		try {

			transaction = entityManager.getTransaction();
			transaction.begin();

			for (int i = 0; i < entityCount; i++) {
				if (i > 0 && i % batchSize == 0) {

					entityManager.flush();
					entityManager.clear();
					transaction.commit();
					transaction.begin();
				}
				ENTITY entity = entities.get(i);
				entityManager.persist(entity);
			}

			transaction.commit();
		} catch (RuntimeException e) {
			if (transaction != null && transaction.isActive()) {
				transaction.rollback();
			}
			throw e;
		} finally {
			entityManager.close();
		}

	}

	@Override
	public List<ENTITY> dumpData() {
		CriteriaBuilder cb = entityManager.getCriteriaBuilder();
		CriteriaQuery<ENTITY> cq = cb.createQuery(entityClass);
		Root<ENTITY> root = cq.from(entityClass);
		cq.select(root);
		return entityManager.createQuery(cq).getResultList();
	}

	private boolean isOrderBy(DbFilter dbFilter) {
		return (dbFilter.getValue() != null && !dbFilter.getValue().toString().isEmpty()
				&& (dbFilter.getValue().toString().equalsIgnoreCase(ORDERBYENUM.ASC.toString())
						|| dbFilter.getValue().toString().equalsIgnoreCase(ORDERBYENUM.DESC.toString())));
	}
}
