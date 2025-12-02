package com.simplevat.service.impl;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.simplevat.constant.dbfilter.StateFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.dao.StateDao;
import com.simplevat.entity.State;
import com.simplevat.service.StateService;

@Service
public class StateServiceImpl extends StateService {

	@Autowired
	private StateDao stateDao;

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
