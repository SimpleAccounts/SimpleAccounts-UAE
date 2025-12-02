package com.simplevat.service.impl;

import com.simplevat.dao.Dao;
import com.simplevat.dao.UnitTypeDao;
import com.simplevat.entity.UnitType;
import com.simplevat.service.UnitTypeService;
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