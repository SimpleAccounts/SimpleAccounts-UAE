package com.simplevat.dao.impl.bankaccount;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import javax.persistence.Query;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import com.simplevat.constant.DatatableSortingFilterConstant;
import com.simplevat.constant.dbfilter.BankAccounrFilterEnum;
import com.simplevat.constant.dbfilter.DbFilter;
import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.bankaccount.BankAccountDao;
import com.simplevat.entity.bankaccount.BankAccount;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

import javax.persistence.TypedQuery;

@Repository
@Transactional
public class BankAccountDaoImpl extends AbstractDao<Integer, BankAccount> implements BankAccountDao {

	private static final Logger LOGGER = LoggerFactory.getLogger(BankAccountDaoImpl.class);

	@Autowired
	private DatatableSortingFilterConstant dataTableUtil;

	@Override
	public List<BankAccount> getBankAccounts() {
		return this.executeNamedQuery("allBankAccounts");
	}

	@SuppressWarnings("unchecked")
	@Override
	public List<BankAccount> getBankAccountByUser(int userId) {
		List<BankAccount> resultList = null;
		try {
			String hql = "from BankAccount where createdBy = :userId";
			Query query = getEntityManager().createQuery(hql);
			query.setParameter("userId", userId);
			resultList = query.getResultList();
		} catch (Exception e) {
			LOGGER.error("Error is", e);
		}
		return resultList;

	}

	@Override
	public BankAccount getBankAccountById(int id) {
		TypedQuery<BankAccount> query = getEntityManager()
				.createQuery("SELECT b FROM BankAccount b WHERE b.bankAccountId =:id", BankAccount.class);
		query.setParameter("id", id);
		List<BankAccount> bankAccountList = query.getResultList();
		if (bankAccountList != null && !bankAccountList.isEmpty()) {
			return bankAccountList.get(0);
		}
		return null;
	}

	@Override
	public void deleteByIds(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				BankAccount bankAccount = findByPK(id);
				bankAccount.setDeleteFlag(Boolean.TRUE);
				update(bankAccount);
			}
		}
	}

	@Override
	public PaginationResponseModel getBankAccounts(Map<BankAccounrFilterEnum, Object> filterDataMap,
			PaginationModel paginationModel) {
		List<DbFilter> dbFilters = new ArrayList<>();
		filterDataMap.forEach((filter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(filter.getDbColumnName())
				.condition(filter.getCondition()).value(value).build()));
		paginationModel
				.setSortingCol(dataTableUtil.getColName((paginationModel.getSortingCol()), DatatableSortingFilterConstant.BANK_ACCOUNT));

		PaginationResponseModel resposne = new PaginationResponseModel();
		resposne.setCount(this.getResultCount(dbFilters));
		resposne.setData(this.executeQuery(dbFilters, paginationModel));
		return resposne;
	}

	@Override
	public BigDecimal getAllBankAccountsTotalBalance() {
		try {
			TypedQuery<BigDecimal> query = getEntityManager().createNamedQuery("allBankAccountsTotalBalance",
					BigDecimal.class);
			List balanceList = query.getResultList();
			return balanceList != null && !balanceList.isEmpty() ? (BigDecimal) balanceList.get(0)
					: BigDecimal.valueOf(0);
		} catch (Exception e) {
			LOGGER.error("Error is", e);
		}
		return null;

	}
}
