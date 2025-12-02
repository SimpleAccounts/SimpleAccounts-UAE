package com.simplevat.dao.impl;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Repository;

import com.simplevat.constant.dbfilter.DbFilter;
import com.simplevat.constant.dbfilter.StateFilterEnum;
import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.StateDao;
import com.simplevat.entity.State;

import javax.persistence.TypedQuery;

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
