package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.StateFilterEnum;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.StateDao;
import com.simpleaccounts.entity.State;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import javax.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

@Repository
public class StateDaoImpl extends AbstractDao<Integer, State> implements StateDao {

	@Override
	public List<State> getstateList(Map<StateFilterEnum, Object> filterMap) {
		List<DbFilter> dbFilters = new ArrayList<>();
		filterMap.forEach(
				(stateFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(stateFilter.getDbColumnName())
						.condition(stateFilter.getCondition()).value(value).build()));
		return this.executeQuery(dbFilters);
	}
	@Override
	public  Integer getStateIdByInputColumnValue(String val){
		TypedQuery<Integer> query = getEntityManager().createNamedQuery("getStateIdByInputColumnValue", Integer.class);
		query.setParameter("val", val);
		query.setMaxResults(1);
		if (query.getSingleResult()!=null){
			return query.getSingleResult();
		}
		return null;
	}
}
