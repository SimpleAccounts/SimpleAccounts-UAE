package com.simplevat.service;

import java.util.List;
import java.util.Map;

import com.simplevat.constant.dbfilter.StateFilterEnum;
import com.simplevat.entity.State;

public abstract class StateService extends SimpleVatService<Integer, State> {
	public abstract List<State> getstateList(Map<StateFilterEnum, Object> filterMap);

    public abstract Integer getStateIdByInputColumnValue(String val);
}
