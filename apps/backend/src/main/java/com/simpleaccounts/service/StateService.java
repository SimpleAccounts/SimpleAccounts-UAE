package com.simpleaccounts.service;

import com.simpleaccounts.constant.dbfilter.StateFilterEnum;
import com.simpleaccounts.entity.State;
import java.util.List;
import java.util.Map;

public abstract class StateService extends SimpleAccountsService<Integer, State> {
	public abstract List<State> getstateList(Map<StateFilterEnum, Object> filterMap);

    public abstract Integer getStateIdByInputColumnValue(String val);
}
