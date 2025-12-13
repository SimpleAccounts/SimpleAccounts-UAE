package com.simpleaccounts.dao.impl;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.UnitTypeDao;
import com.simpleaccounts.entity.UnitType;
import org.springframework.stereotype.Repository;

@Repository
public class UnitTypeDaoImpl extends AbstractDao<Integer, UnitType> implements UnitTypeDao {
}
