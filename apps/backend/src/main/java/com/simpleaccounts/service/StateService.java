package com.simpleaccounts.service;

import java.util.List;
import java.util.Map;

import com.simpleaccounts.constant.dbfilter.StateFilterEnum;
import com.simpleaccounts.entity.State;

public abstract class StateService extends SimpleAccountsService<Integer, State> {
	public abstract List<State> getstateList(Map<StateFilterEnum, Object> filterMap);

    public abstract Integer getStateIdByInputColumnValue(String val);
}
