package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.PlaceOfSupplyDao;
import com.simplevat.entity.PlaceOfSupply;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Created By Zain Khan On 21-12-2020
 */
@Repository
public class PlaceOfSupplyDaoImpl extends AbstractDao<Integer, PlaceOfSupply> implements PlaceOfSupplyDao {


    public List<PlaceOfSupply> getPlaceOfSupplyForDropdown(){
        return getEntityManager().createNamedQuery("getAllPlaceOfSupplyForDropdown", PlaceOfSupply.class).getResultList();
    }
}
