package com.simplevat.dao;

import java.util.List;
import java.util.Map;

import com.simplevat.constant.dbfilter.StateFilterEnum;
import com.simplevat.entity.State;

public interface StateDao extends Dao<Integer, State> {

	List<State> getstateList(Map<StateFilterEnum, Object> filterMap);

    Integer getStateIdByInputColumnValue(String val);
}
