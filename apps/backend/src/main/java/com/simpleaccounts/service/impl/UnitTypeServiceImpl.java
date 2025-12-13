package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.UnitTypeDao;
import com.simpleaccounts.entity.UnitType;
import com.simpleaccounts.service.UnitTypeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("UnitTypeService")
@RequiredArgsConstructor
public class UnitTypeServiceImpl extends UnitTypeService {

    private final UnitTypeDao unitTypeDao;

    @Override
    protected Dao<Integer, UnitType> getDao() {
        return unitTypeDao;
    }
}