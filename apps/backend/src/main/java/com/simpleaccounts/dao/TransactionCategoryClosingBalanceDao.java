package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.TransactionCategoryBalanceFilterEnum;
import com.simpleaccounts.entity.TransactionCategoryClosingBalance;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.model.VatReportModel;
import com.simpleaccounts.model.VatReportResponseModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.rest.financialreport.FinancialReportRequestModel;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface TransactionCategoryClosingBalanceDao extends Dao<Integer, TransactionCategoryClosingBalance> {

    public PaginationResponseModel getAll(Map<TransactionCategoryBalanceFilterEnum, Object> filterMap);

    public List<TransactionCategoryClosingBalance> getClosingBalanceForTimeRange(LocalDateTime closingBalanceStartDate, LocalDateTime closingBalanceEndDate,
                                                                                 TransactionCategory transactionCategory);

    public List<TransactionCategoryClosingBalance> getClosingBalanceGreaterThanCurrentDate( LocalDateTime closingBalanceEndDate,
                                                                                 TransactionCategory transactionCategory);
    public TransactionCategoryClosingBalance getClosingBalanceLessThanCurrentDate( LocalDateTime closingBalanceEndDate,
                                                                                            TransactionCategory transactionCategory);

    public TransactionCategoryClosingBalance getLastClosingBalanceByDate(TransactionCategory category);
    public TransactionCategoryClosingBalance getFirstClosingBalanceByDate(TransactionCategory category);

    public List<TransactionCategoryClosingBalance> getList(ReportRequestModel reportRequestModel);
    public List<TransactionCategoryClosingBalance> getListByChartOfAccountIds(ReportRequestModel reportRequestModel);
    public List<VatReportModel> getListByplaceOfSupply(FinancialReportRequestModel reportRequestModel);
    public void sumOfTotalAmountExce(FinancialReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel);
    public BigDecimal getTotalZeroVatAmount();

    public BigDecimal sumOfTotalAmountClosingBalance(FinancialReportRequestModel reportRequestModel, String lastMonth);
}
