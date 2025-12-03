package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.UnitTypeDao;
import com.simpleaccounts.entity.UnitType;
import com.simpleaccounts.service.UnitTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("UnitTypeService")
public class UnitTypeServiceImpl extends UnitTypeService {

    @Autowired
    UnitTypeDao unitTypeDao;

    @Override
    protected Dao<Integer, UnitType> getDao() {
        return unitTypeDao;
    }
}