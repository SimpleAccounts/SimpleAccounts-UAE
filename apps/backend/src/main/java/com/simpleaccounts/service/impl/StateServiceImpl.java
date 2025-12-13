package com.simpleaccounts.service.impl;

import com.simpleaccounts.constant.dbfilter.StateFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.StateDao;
import com.simpleaccounts.entity.State;
import com.simpleaccounts.service.StateService;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StateServiceImpl extends StateService {

	private final StateDao stateDao;

	@Override
	protected Dao<Integer, State> getDao() {
		return stateDao;
	}

	@Override
	public List<State> getstateList(Map<StateFilterEnum, Object> filterMap) {
		return stateDao.getstateList(filterMap);
	}
	@Override
	public  Integer getStateIdByInputColumnValue(String val){
		return stateDao.getStateIdByInputColumnValue(val);
	}
}
