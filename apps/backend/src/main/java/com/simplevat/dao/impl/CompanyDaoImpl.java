/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simplevat.dao.impl;

import com.simplevat.constant.dbfilter.CompanyFilterEnum;
import com.simplevat.constant.dbfilter.DbFilter;
import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.CompanyDao;
import com.simplevat.entity.Company;
import com.simplevat.entity.Currency;
import com.simplevat.rest.DropdownModel;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

import javax.persistence.Query;
import javax.persistence.TypedQuery;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author admin
 */
@Repository(value = "companyDao")
public class CompanyDaoImpl extends AbstractDao<Integer, Company> implements CompanyDao {

	public Company getCompany() {
		TypedQuery<Company> query = getEntityManager().createQuery("SELECT c FROM Company c", Company.class);
		List<Company> companys = query.getResultList();
		if (companys != null && !companys.isEmpty()) {
			return companys.get(0);
		}
		return null;
	}

//	public List<Integer> getDbConnection(){
//		return this.executeNamedQuery("getDbConnection");
//	}
public Integer getDbConncection(){
	Query query = getEntityManager().createQuery(
			"SELECT 1 FROM Company cc" );
	List<Integer> countList = query.getResultList();
	if (countList != null && !countList.isEmpty()) {
		return countList.get(0);
	}
	return null;
}

	@Override
	public List<Company> getCompanyList(Map<CompanyFilterEnum, Object> filterMap) {
		List<DbFilter> dbFilters = new ArrayList<>();
		filterMap.forEach(
				(productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
						.condition(productFilter.getCondition()).value(value).build()));
		return this.executeQuery(dbFilters);
	}

	@Override
	public List<DropdownModel> getCompaniesForDropdown() {
		return getEntityManager().createNamedQuery("companiesForDropdown", DropdownModel.class).getResultList();
	}

	@Override
	@Transactional
	public void deleteByIds(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				Company company = findByPK(id);
				company.setDeleteFlag(Boolean.TRUE);
				update(company);
			}
		}
	}
	@Override
	public Currency getCompanyCurrency() {
		TypedQuery<Currency> query = getEntityManager().createQuery("select c from Currency c where c.currencyCode IN(SELECT cc.currencyCode FROM Company cc)", Currency.class);
		List<Currency> currencyList = query.getResultList();
		if (currencyList != null && !currencyList.isEmpty()) {
			return currencyList.get(0);
		}
		return null;
	}

}
