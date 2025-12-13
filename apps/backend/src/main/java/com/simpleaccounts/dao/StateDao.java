package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.StateFilterEnum;
import com.simpleaccounts.entity.State;
import java.util.List;
import java.util.Map;

public interface StateDao extends Dao<Integer, State> {

	List<State> getstateList(Map<StateFilterEnum, Object> filterMap);

    Integer getStateIdByInputColumnValue(String val);
}
