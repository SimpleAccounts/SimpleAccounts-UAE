/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.CompanyTypeDao;
import com.simplevat.entity.CompanyType;

import java.util.ArrayList;
import java.util.List;
import javax.persistence.TypedQuery;
import org.springframework.stereotype.Repository;

/**
 *
 * @author admin
 */
@Repository(value = "companyTypeDao")
public class CompanyTypeDaoImpl extends AbstractDao<Integer, CompanyType> implements CompanyTypeDao {

	@Override
	public List<CompanyType> getCompanyTypes() {
		TypedQuery<CompanyType> query = getEntityManager().createQuery("Select c From CompanyType c",
				CompanyType.class);
		List<CompanyType> companyTypeList = query.getResultList();
		if (companyTypeList != null && !companyTypeList.isEmpty()) {
			return companyTypeList;
		}
		return new ArrayList<>();
	}

}
