package com.simpleaccounts.rest.transactioncategorybalancecontroller;

import com.simpleaccounts.entity.TransactionCategoryBalance;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.exceptions.ServiceException;
import com.simpleaccounts.service.TransactionCategoryBalanceService;
import com.simpleaccounts.service.TransactionCategoryService;
import com.simpleaccounts.service.exceptions.ServiceErrorCode;
import com.simpleaccounts.utils.DateUtils;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class TransactionCategoryBalanceRestHelper {
	private final Logger logger = LoggerFactory.getLogger(TransactionCategoryBalanceRestHelper.class);
	private final TransactionCategoryService transactionCategoryService;

	private final TransactionCategoryBalanceService transactionCategoryBalanceService;

	private final DateUtils dateUtil;

	public TransactionCategoryBalance getEntity(TransactioncategoryBalancePersistModel persistModel) {

		if (persistModel == null) {
			throw new ServiceException("NO DATA AVAILABLE", ServiceErrorCode.BadRequest);
		}

		TransactionCategory category = transactionCategoryService.findByPK(persistModel.getTransactionCategoryId());
		if (category == null) {
			throw new ServiceException("NO DATA AVAILABLE", ServiceErrorCode.RecordDoesntExists);
		}

		TransactionCategoryBalance transactionCategoryBalance = new TransactionCategoryBalance();

		if (persistModel.getTransactionCategoryBalanceId() != null) {
			transactionCategoryBalance = transactionCategoryBalanceService
					.findByPK(persistModel.getTransactionCategoryBalanceId());
		}

		transactionCategoryBalance.setTransactionCategory(category);
		transactionCategoryBalance.setOpeningBalance(persistModel.getOpeningBalance());
		transactionCategoryBalance.setRunningBalance(
				transactionCategoryBalance.getRunningBalance() != null ? transactionCategoryBalance.getRunningBalance()
						: persistModel.getOpeningBalance());
		Instant instant = Instant.ofEpochMilli(persistModel.getEffectiveDate().getTime());
		LocalDateTime date = LocalDateTime.ofInstant(instant,
				ZoneId.systemDefault());
		transactionCategoryBalance
				.setEffectiveDate(dateUtil.get(date));

		return transactionCategoryBalance;
	}

	public List<TransactionCategoryBalanceListModel> getList(List<TransactionCategoryBalance> balaneList) {

		if (balaneList != null && !balaneList.isEmpty()) {

			List<TransactionCategoryBalanceListModel> modelList = new ArrayList<>();

			for (TransactionCategoryBalance balance : balaneList) {
				if(balance!=null && balance.getTransactionCategory()!=null) {

					TransactionCategoryBalanceListModel model = new TransactionCategoryBalanceListModel();
					model.setTransactionCategoryId(balance.getTransactionCategory().getTransactionCategoryId());
					model.setTransactionCategoryBalanceId(balance.getId());
					model.setEffectiveDate(dateUtil.getLocalDateToString(balance.getEffectiveDate(), "dd/MM/yyyy"));
					model.setOpeningBalance(balance.getOpeningBalance());
					model.setRunningBalance(balance.getRunningBalance());
					model.setTransactionCategoryName(balance.getTransactionCategory().getTransactionCategoryName());
					model.setChartOfAccount(balance.getTransactionCategory().getChartOfAccount().getChartOfAccountName());

					modelList.add(model);
				}
				else
				{
					logger.error("Transaction category is null for following Opening balance ",balance );
				}
			}
			Collections.reverse(modelList);
			return modelList;
		}
		return new ArrayList<>();
	}
	public TransactioncategoryBalancePersistModel getRequestModel(TransactionCategoryBalance transactionCategoryBalance) {
		TransactioncategoryBalancePersistModel transactioncategoryBalancePersistModel = new TransactioncategoryBalancePersistModel();
		transactioncategoryBalancePersistModel.setTransactionCategoryBalanceId(transactionCategoryBalance.getId());
		transactioncategoryBalancePersistModel.setOpeningBalance(transactionCategoryBalance.getOpeningBalance());
		transactioncategoryBalancePersistModel.setEffectiveDate(transactionCategoryBalance.getEffectiveDate());
		transactioncategoryBalancePersistModel.setTransactionCategoryId(transactionCategoryBalance.getTransactionCategory().getTransactionCategoryId());
		return transactioncategoryBalancePersistModel;
	}
}
