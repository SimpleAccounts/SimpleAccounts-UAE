package com.simplevat.service.impl;

import com.simplevat.dao.Dao;
import com.simplevat.dao.PlaceOfSupplyDao;
import com.simplevat.entity.Invoice;
import com.simplevat.entity.PlaceOfSupply;
import com.simplevat.service.PlaceOfSupplyService;
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
