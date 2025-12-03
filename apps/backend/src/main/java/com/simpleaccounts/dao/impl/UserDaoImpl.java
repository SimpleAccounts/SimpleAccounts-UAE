package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.UserDao;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import javax.persistence.Query;

import com.simpleaccounts.rest.DropdownModel;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.UserFilterEnum;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.util.ArrayList;
import javax.persistence.TypedQuery;
import org.springframework.transaction.annotation.Transactional;

@Repository(value = "userDao")
public class UserDaoImpl extends AbstractDao<Integer, User> implements UserDao {

	@Autowired
	private DatatableSortingFilterConstant dataTableUtil;

	public Optional<User> getUserByEmail(String emailAddress) {
		Query query = this.getEntityManager().createQuery("SELECT u FROM User AS u WHERE u.userEmail =:email AND u.isActive=true AND u.deleteFlag=false");
		query.setParameter("email", emailAddress);
		List resultList = query.getResultList();
		if (CollectionUtils.isNotEmpty(resultList) && resultList.size() == 1) {
			return Optional.of((User) resultList.get(0));
		}
		return Optional.empty();
	}

	public User getUserEmail(String emailAddress) {
		TypedQuery<User> query = this.getEntityManager()
				.createQuery("SELECT u FROM User AS u WHERE u.userEmail =:email ", User.class);
		query.setParameter("email", emailAddress);
		List<User> resultList = query.getResultList();
		if (resultList != null && !resultList.isEmpty()) {
			return resultList.get(0);
		} else {
			return null;
		}
	}

	@Override
	public boolean getUserByEmail(String usaerName, String password) {
		TypedQuery<User> query = getEntityManager().createQuery(
				"SELECT u FROM User u WHERE u.userEmail =:userEmail AND u.password =:password", User.class);
		query.setParameter("userEmail", usaerName);
		query.setParameter("password", password);
		User user = query.getSingleResult();
		return user != null;
	}

	@Override
	public User getUserPassword(Integer userId) {
		TypedQuery<User> query = getEntityManager().createQuery(
				"SELECT u FROM User u WHERE u.userId =:userId ", User.class);
		query.setParameter("userId", userId);
		User user = query.getSingleResult();
		return user;
	}

	@Override
	public List<User> getAllUserNotEmployee() {
		TypedQuery<User> query = this.getEntityManager()
				.createQuery("SELECT u FROM User AS u WHERE u.employeeId IS NULL", User.class);
		List<User> resultList = query.getResultList();
		if (resultList != null && !resultList.isEmpty()) {
			return resultList;
		} else {
			return new ArrayList<>();
		}
	}

	@Override
	@Transactional
	public void deleteByIds(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				User user = findByPK(id);
				user.setDeleteFlag(Boolean.TRUE);
				update(user);
			}
		}
	}

	@Override
	public PaginationResponseModel getUserList(Map<UserFilterEnum, Object> filterMap, PaginationModel paginationModel) {
		List<DbFilter> dbFilters = new ArrayList<>();
		filterMap.forEach(
				(productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
						.condition(productFilter.getCondition()).value(value).build()));
		paginationModel.setSortingCol(dataTableUtil.getColName(paginationModel.getSortingCol(), DatatableSortingFilterConstant.USER));
		return new PaginationResponseModel(this.getResultCount(dbFilters),
				this.executeQuery(dbFilters, paginationModel));
	}

	@Override
	public List<DropdownModel> getUserForDropdown() {
		return getEntityManager().createNamedQuery("userForDropdown", DropdownModel.class).getResultList();
	}

	public List<Integer> getAllUserIds()
	{
		Query query = this.getEntityManager().createQuery("SELECT u.userId FROM User AS u");
		return query.getResultList();

	}

	public  List<DropdownModel> getUserForPayrollDropdown(Integer userId)
	{
		return getEntityManager().createNamedQuery("userForPayrollDropdown", DropdownModel.class).setParameter("userId",userId).getResultList();
	}
}
