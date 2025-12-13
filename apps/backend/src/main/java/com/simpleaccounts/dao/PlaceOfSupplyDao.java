package com.simpleaccounts.dao;

import com.simpleaccounts.entity.PlaceOfSupply;

import java.util.List;

/**
 * Created By Zain Khan On 21-12-2020
 */
public interface PlaceOfSupplyDao extends Dao<Integer, PlaceOfSupply>{
    public List<PlaceOfSupply> getPlaceOfSupplyForDropdown();

}
