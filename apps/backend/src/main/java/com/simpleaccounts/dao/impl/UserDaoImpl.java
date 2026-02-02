package com.simpleaccounts.dao.impl;

import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.UserFilterEnum;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.UserDao;
import com.simpleaccounts.entity.User;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import jakarta.persistence.Query;
import jakarta.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.transaction.PlatformTransactionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Repository(value = "userDao")
@RequiredArgsConstructor
public class UserDaoImpl extends AbstractDao<Integer, User> implements UserDao {

	private static final Logger logger = LoggerFactory.getLogger(UserDaoImpl.class);
	private final DatatableSortingFilterConstant dataTableUtil;
	private final JdbcTemplate jdbcTemplate;
	private final PlatformTransactionManager transactionManager;

	public Optional<User> getUserByEmail(String emailAddress) {
		Query query = this.getEntityManager().createQuery("SELECT u FROM User AS u WHERE u.userEmail =:email AND u.isActive=true AND u.deleteFlag=false");
		query.setParameter("email", emailAddress);
		@SuppressWarnings("unchecked")
		List<User> resultList = query.getResultList();
		if (CollectionUtils.isNotEmpty(resultList) && resultList.size() == 1) {
			return Optional.of(resultList.get(0));
		}
		return Optional.empty();
	}

	public User getUserEmail(String emailAddress) {
		// Clear any cached entities to ensure we get fresh data from database
		getEntityManager().clear();
		
		TypedQuery<User> query = this.getEntityManager()
				.createQuery("SELECT u FROM User AS u WHERE u.userEmail =:email ", User.class);
		query.setParameter("email", emailAddress);
		// Use setHint to bypass cache and get fresh data
		query.setHint("jakarta.persistence.cache.retrieveMode", "BYPASS");
		query.setHint("jakarta.persistence.cache.storeMode", "BYPASS");
		
		List<User> resultList = query.getResultList();
		
		if (resultList != null && !resultList.isEmpty()) {
			User user = resultList.get(0);
			
			// Detach the entity to prevent Hibernate from flushing it and overwriting JDBC updates
			getEntityManager().detach(user);
			// Clear EntityManager after detaching
			getEntityManager().clear();
			
			return user;
		}
		
		return null;
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
		@SuppressWarnings("unchecked")
		List<Integer> resultList = this.getEntityManager().createQuery("SELECT u.userId FROM User AS u").getResultList();
		return resultList;
	}

	public  List<DropdownModel> getUserForPayrollDropdown(Integer userId)
	{
		return getEntityManager().createNamedQuery("userForPayrollDropdown", DropdownModel.class).setParameter("userId",userId).getResultList();
	}
	
	@Override
	@Transactional(propagation = Propagation.REQUIRES_NEW)
	public boolean updateForgotPasswordToken(Integer userId, String token, java.sql.Timestamp expiryDate, java.sql.Timestamp updateDate) {
		try {
			// Clear entity manager before update to ensure no stale entities interfere
			getEntityManager().clear();
			
			jakarta.persistence.Query updateQuery = getEntityManager().createNativeQuery(
				"UPDATE SA_USER SET FORGOT_PASS_TOKEN = :token, " +
				"FORGOT_PASSWORD_TOKEN_EXPIRY_DATE = :expiryDate, " +
				"LAST_UPDATE_DATE = :updateDate " +
				"WHERE USER_ID = :userId"
			);
			updateQuery.setParameter("token", token);
			updateQuery.setParameter("expiryDate", expiryDate);
			updateQuery.setParameter("updateDate", updateDate);
			updateQuery.setParameter("userId", userId);
			
			int updatedRows = updateQuery.executeUpdate();
			getEntityManager().flush();
			
			if (updatedRows == 0) {
				getEntityManager().clear();
				return false;
			}
			
			// Clear again after flush to prevent any entity state from interfering
			getEntityManager().clear();
			
			// Verify the update worked by querying with a fresh EntityManager state
			jakarta.persistence.Query verifyQuery = getEntityManager().createNativeQuery("SELECT FORGOT_PASS_TOKEN FROM SA_USER WHERE USER_ID = :userId");
			verifyQuery.setParameter("userId", userId);
			String savedToken = (String) verifyQuery.getSingleResult();
			
			if (savedToken != null && savedToken.equals(token)) {
				// Clear one more time to ensure clean state when transaction commits
				getEntityManager().clear();
				return true;
			} else {
				return false;
			}
		} catch (Exception e) {
			getEntityManager().clear(); // Clear on error too
			throw new RuntimeException("Failed to update forgot password token for userId: " + userId, e);
		}
	}
	
	@Override
	public boolean updateForgotPasswordTokenByEmail(String userEmail, String token, java.sql.Timestamp expiryDate, java.sql.Timestamp updateDate) {
		try {
			// Clear EntityManager before update to ensure no managed entities interfere
			getEntityManager().clear();
			
			// Use TransactionTemplate with REQUIRES_NEW to ensure independent transaction that commits properly
			String updateSql = "UPDATE SA_USER SET FORGOT_PASS_TOKEN = ?, " +
			                   "FORGOT_PASSWORD_TOKEN_EXPIRY_DATE = ?, " +
			                   "LAST_UPDATE_DATE = ? " +
			                   "WHERE USER_EMAIL = ?";
			
			TransactionTemplate transactionTemplate = new TransactionTemplate(transactionManager);
			transactionTemplate.setPropagationBehavior(org.springframework.transaction.TransactionDefinition.PROPAGATION_REQUIRES_NEW);
			transactionTemplate.setIsolationLevel(org.springframework.transaction.TransactionDefinition.ISOLATION_READ_COMMITTED);
			
			int updatedRows = transactionTemplate.execute(status -> {
				int rows = jdbcTemplate.update(updateSql, token, expiryDate, updateDate, userEmail);
				
				if (rows == 0) {
					logger.error("No rows updated for email: {}", userEmail);
					status.setRollbackOnly();
					return 0;
				}
				
				// Verify the token is saved before the transaction commits
				String verifyToken = jdbcTemplate.queryForObject("SELECT FORGOT_PASS_TOKEN FROM SA_USER WHERE USER_EMAIL = ?", String.class, userEmail);
				if (verifyToken == null || !verifyToken.equals(token)) {
					logger.error("Token verification failed after UPDATE within transaction for email: {}", userEmail);
					status.setRollbackOnly();
					return 0;
				}
				
				return rows;
			});
			
			if (updatedRows == 0) {
				logger.error("Transaction rolled back or no rows updated for email: {}", userEmail);
				return false;
			}
			
			// Clear EntityManager after transaction commit to prevent any managed entities from being flushed
			getEntityManager().clear();
			
			// Check for any managed User entities and detach them
			try {
				Integer userId = jdbcTemplate.queryForObject("SELECT USER_ID FROM SA_USER WHERE USER_EMAIL = ?", Integer.class, userEmail);
				if (userId != null) {
					User managedUser = getEntityManager().find(User.class, userId);
					if (managedUser != null && getEntityManager().contains(managedUser)) {
						// Clear token and detach managed entity to prevent overwrite
						managedUser.setForgotPasswordToken(null);
						getEntityManager().detach(managedUser);
					}
				}
			} catch (Exception e) {
				logger.warn("Could not check for managed User entity: {}", e.getMessage());
			}
			
			// Final EntityManager clear
			getEntityManager().clear();
			return true;
		} catch (Exception e) {
			logger.error("Failed to update forgot password token for email: " + userEmail, e);
			throw new RuntimeException("Failed to update forgot password token for email: " + userEmail, e);
		}
	}
	
	@Override
	public String verifyTokenFromDatabase(String userEmail) {
		try {
			// Clear EntityManager to ensure no cached state
			getEntityManager().clear();
			
			// Use JdbcTemplate to get a fresh connection from the pool (bypassing Hibernate)
			String verifySql = "SELECT FORGOT_PASS_TOKEN FROM SA_USER WHERE USER_EMAIL = ?";
			String token = jdbcTemplate.queryForObject(verifySql, String.class, userEmail);
			
			// Clear EntityManager after query to ensure no User entity is loaded into persistence context
			getEntityManager().clear();
			
			return token;
		} catch (org.springframework.dao.EmptyResultDataAccessException e) {
			return null;
		} catch (Exception e) {
			logger.warn("Exception in verifyTokenFromDatabase: {}", e.getMessage());
			return null;
		}
	}
}
