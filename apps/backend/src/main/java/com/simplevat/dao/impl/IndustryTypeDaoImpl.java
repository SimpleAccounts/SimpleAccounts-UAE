/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.IndustryTypeDao;
import com.simplevat.entity.IndustryType;
import java.util.List;
import javax.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

/**
 *
 * @author admin
 */
@Repository(value = "industryTypeDao")
public class IndustryTypeDaoImpl extends AbstractDao<Integer, IndustryType> implements IndustryTypeDao {

    @Override
    public List<IndustryType> getIndustryTypes() {
        TypedQuery<IndustryType> query = getEntityManager().createQuery("Select i from IndustryType i", IndustryType.class);
        List<IndustryType> industryTypeList = query.getResultList();
        if (industryTypeList != null && !industryTypeList.isEmpty()) {
            return industryTypeList;
        }
        return industryTypeList;
    }

}
