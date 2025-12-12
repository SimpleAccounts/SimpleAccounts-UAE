package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.PlaceOfSupplyDao;

import com.simpleaccounts.entity.PlaceOfSupply;
import com.simpleaccounts.service.PlaceOfSupplyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Created By Zain Khan On 21-12-2020
 */
@Service("PlaceOfSupplyService")
public class PlaceOfSupplyServiceImpl extends PlaceOfSupplyService {
    @Autowired
    PlaceOfSupplyDao placeOfSupplyDao;
    @Override
    public List<PlaceOfSupply> getPlaceOfSupplyForDropdown() {
        return placeOfSupplyDao.getPlaceOfSupplyForDropdown();
    }
    @Override
    protected Dao<Integer, PlaceOfSupply> getDao() {
        return placeOfSupplyDao;
    }
}
