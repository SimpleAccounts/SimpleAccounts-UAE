package com.simpleaccounts.dao.impl.bankaccount;

import com.simpleaccounts.constant.CommonColumnConstants;
import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.TransactionCategoryCodeEnum;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.constant.dbfilter.TransactionCategoryFilterEnum;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.bankaccount.TransactionCategoryDao;
import com.simpleaccounts.entity.bankaccount.ChartOfAccount;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.bankaccount.ChartOfAccountService;
import java.util.*;
import java.util.stream.Collectors;
import javax.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.apache.commons.collections4.CollectionUtils;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository(value = "transactionCategoryDao")
@RequiredArgsConstructor
public class TransactionCategoryDaoImpl extends AbstractDao<Integer, TransactionCategory>
		implements TransactionCategoryDao {

	private final DatatableSortingFilterConstant dataTableUtil;

	private final ChartOfAccountService chartOfAccountService;

	@Lazy
	private final TransactionCategoryService transactionCategoryService;
	@Override
	public TransactionCategory getDefaultTransactionCategory() {
		List<TransactionCategory> transactionCategories = findAllTransactionCategory();

		if (CollectionUtils.isNotEmpty(transactionCategories)) {
			return transactionCategories.get(0);
		}
		return null;
	}

	@Override
	public List<TransactionCategory> findAllTransactionCategory() {
		return this.executeNamedQuery("findAllTransactionCategory");
	}

	@Override
	public TransactionCategory updateOrCreateTransaction(TransactionCategory transactionCategory) {
		return this.update(transactionCategory);
	}

	@Override
	public List<TransactionCategory> findAllTransactionCategoryByChartOfAccountIdAndName(Integer chartOfAccountId,
			String name) {
		TypedQuery<TransactionCategory> query = getEntityManager().createQuery(
				"SELECT t FROM TransactionCategory t where t.deleteFlag=FALSE AND t.chartOfAccount.chartOfAccountId =:chartOfAccountId AND t.transactionCategoryName LIKE '%'||:transactionCategoryName||'%' ORDER BY t.defaltFlag DESC , t.orderSequence,t.transactionCategoryName ASC",
				TransactionCategory.class);
		query.setParameter(CommonColumnConstants.CHARTOFACCOUNT_ID, chartOfAccountId);
		query.setParameter("transactionCategoryName", name);
		if (query.getResultList() != null && !query.getResultList().isEmpty()) {
			return query.getResultList();
		}
		return new ArrayList<>();
	}

	@Override
	public List<TransactionCategory> findAllTransactionCategoryByChartOfAccount(Integer chartOfAccountId) {
		TypedQuery<TransactionCategory> query = getEntityManager().createQuery(
				"SELECT t FROM TransactionCategory t where t.deleteFlag=FALSE AND (t.chartOfAccount.chartOfAccountId =:chartOfAccountId  or t.chartOfAccount.parentChartOfAccount.chartOfAccountId =:chartOfAccountId) ORDER BY t.defaltFlag DESC , t.orderSequence,t.transactionCategoryName ASC",
				TransactionCategory.class);
		query.setParameter(CommonColumnConstants.CHARTOFACCOUNT_ID, chartOfAccountId);
		if (query.getResultList() != null && !query.getResultList().isEmpty()) {
			return query.getResultList();
		}
		return new ArrayList<>();
	}

	@Override
	public TransactionCategory findTransactionCategoryByTransactionCategoryCode(String transactionCategoryCode) {
		TypedQuery<TransactionCategory> query = getEntityManager().createQuery(
				"SELECT t FROM TransactionCategory t where t.transactionCategoryCode =:transactionCategoryCode",
				TransactionCategory.class);
		query.setParameter("transactionCategoryCode", transactionCategoryCode);
		if (query.getResultList() != null && !query.getResultList().isEmpty()) {
			return query.getResultList().get(0);
		}
		return null;
	}

	@Override
	public List<TransactionCategory> findTransactionCategoryListByParentCategory(Integer parentCategoryId) {
		TypedQuery<TransactionCategory> query = getEntityManager().createQuery(
				"SELECT t FROM TransactionCategory t where t.deleteFlag=FALSE AND t.parentTransactionCategory.transactionCategoryId =:parentCategoryId ORDER BY t.defaltFlag DESC , t.orderSequence ASC, t.transactionCategoryName ASC",
				TransactionCategory.class);
		query.setParameter("parentCategoryId", parentCategoryId);
		if (query.getResultList() != null && !query.getResultList().isEmpty()) {
			return query.getResultList();
		}
		return new ArrayList<>();

	}

	@Override
	public TransactionCategory getDefaultTransactionCategoryByTransactionCategoryId(Integer transactionCategoryId) {
		TypedQuery<TransactionCategory> query = getEntityManager().createQuery(
				"SELECT t FROM TransactionCategory t where t.deleteFlag=FALSE AND t.defaltFlag = 'Y' AND t.transactionCategoryId !=:transactionCategoryId ORDER BY t.defaltFlag DESC , t.orderSequence ASC, t.transactionCategoryName ASC",
				TransactionCategory.class);
		query.setParameter("transactionCategoryId", transactionCategoryId);
		List<TransactionCategory> transactionCategoryList = query.getResultList();
		if (transactionCategoryList != null && !transactionCategoryList.isEmpty()) {
			return transactionCategoryList.get(0);
		}
		return null;
	}

	@Override
	@Transactional
	public void deleteByIds(List<Integer> ids) {
		if (ids != null && !ids.isEmpty()) {
			for (Integer id : ids) {
				TransactionCategory transactionCategory = findByPK(id);
				transactionCategory.setDeleteFlag(Boolean.TRUE);
				update(transactionCategory);
			}
		}
	}

	@Override
	public PaginationResponseModel getTransactionCategoryList(Map<TransactionCategoryFilterEnum, Object> filterMap,
			PaginationModel paginationModel) {
		List<DbFilter> dbFilters = new ArrayList<>();
		filterMap.forEach((transactionCategoryFilter, value) -> dbFilters
				.add(DbFilter.builder().dbCoulmnName(transactionCategoryFilter.getDbColumnName())
						.condition(transactionCategoryFilter.getCondition()).value(value).build()));
		paginationModel.setSortingCol(dataTableUtil.getColName(paginationModel.getSortingCol(),
				DatatableSortingFilterConstant.CHART_OF_ACCOUNT));
		/**
		 * Added for Pagination issue
		 */
		List<String> transactionCategoryCodeEnums=new ArrayList<>();
		transactionCategoryCodeEnums.add(TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_ASSETS.getCode());
		transactionCategoryCodeEnums.add(TransactionCategoryCodeEnum.OPENING_BALANCE_OFFSET_LIABILITIES.getCode());

		Map<String,Object> transactionCategorymap = new HashMap<>();
		ChartOfAccount chartOfAccount=chartOfAccountService.findByPK(7);
		transactionCategorymap.put("chartOfAccount", chartOfAccount);
		List<TransactionCategory> transactionCategories=transactionCategoryService.findByAttributes(transactionCategorymap);

		List<String> bankCodes=transactionCategories.stream()
				.distinct()
				.map(TransactionCategory:: getTransactionCategoryCode)
				.collect(Collectors.toList());

		transactionCategoryCodeEnums.addAll(bankCodes);
		dbFilters.add(DbFilter.builder().dbCoulmnName("transactionCategoryCode")
										.condition(" NOT IN(:transactionCategoryCode)")
										.value(transactionCategoryCodeEnums).build());
		Integer count = this.getResultCount(dbFilters);

		List<TransactionCategory> list = this.executeQuery(dbFilters, paginationModel);
		return new PaginationResponseModel(count,list);
	}

	@Override
	public String getNxtTransactionCatCodeByChartOfAccount(ChartOfAccount chartOfAccount) {
		List<TransactionCategory> result = getEntityManager()
				.createNamedQuery("findMaxTnxCodeByChartOfAccId", entityClass)
				.setParameter(CommonColumnConstants.CHARTOFACCOUNT_ID, chartOfAccount).setMaxResults(1).getResultList();

		String chartOfAccountCode = chartOfAccount.getChartOfAccountCode();

		String trnxCatCode = result != null && result.size() > 0 && result.get(0).getTransactionCategoryCode() != null
				? result.get(0).getTransactionCategoryCode()
				: "0";

		String[] arr = trnxCatCode.split("-");
		trnxCatCode = arr.length > 0 ? arr[arr.length - 1] : "0";

		// considered valid no
		Integer d = Integer.valueOf(trnxCatCode);

		return chartOfAccountCode + "-" + String.format("%03d", (d + 1));
	}

	@Override
	public List<TransactionCategory> getTransactionCatByChartOfAccountCategoryId(Integer chartOfAccountCategoryId) {
		return getEntityManager().createNativeQuery("SELECT * FROM TRANSACTION_CATEGORY WHERE DELETE_FLAG = 'false' AND TRANSACTION_CATEGORY_ID IN (SELECT TRANSACTION_CATEGORY_ID from COAC_TRANSACTION_CATEGORY where  CHART_OF_ACCOUNT_CATEGORY_ID = :coaCategoryId)",TransactionCategory.class)
				.setParameter("coaCategoryId", chartOfAccountCategoryId).getResultList();
	}

	@Override
	public List<TransactionCategory> findTnxCatForReicpt() {
		return getEntityManager().createNamedQuery("findTnxCatForReicpt").getResultList();
	}
	@Override
	public List<TransactionCategory> getTransactionCategoryListForSalesProduct(){

		return getEntityManager().createNamedQuery("getTransactionCategoryListForSalesProduct").getResultList();
	}
	@Override
	public List<TransactionCategory> getTransactionCategoryListForPurchaseProduct(){
		return getEntityManager().createNamedQuery("getTransactionCategoryListForPurchaseProduct").getResultList();
	}
	@Override
	public List<TransactionCategory> getTransactionCategoryListForInventory(){
		return getEntityManager().createNamedQuery("getTransactionCategoryListForInventory").getResultList();
	}
    @Override
	public List<TransactionCategory> getTransactionCategoryListManualJornal(){
		return getEntityManager().createNamedQuery("getTransactionCategoryListManualJornal").getResultList();
	}
}
