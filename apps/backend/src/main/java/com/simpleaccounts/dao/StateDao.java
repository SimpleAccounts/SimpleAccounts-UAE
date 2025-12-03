package com.simpleaccounts.dao;

import java.util.List;
import java.util.Map;

import com.simpleaccounts.constant.dbfilter.StateFilterEnum;
import com.simpleaccounts.entity.State;

public interface StateDao extends Dao<Integer, State> {

	List<State> getstateList(Map<StateFilterEnum, Object> filterMap);

    Integer getStateIdByInputColumnValue(String val);
}
