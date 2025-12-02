package com.simplevat.dao.impl;
import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.UnitTypeDao;
import com.simplevat.entity.UnitType;
import org.springframework.stereotype.Repository;

@Repository
public class UnitTypeDaoImpl extends AbstractDao<Integer, UnitType> implements UnitTypeDao {
}
