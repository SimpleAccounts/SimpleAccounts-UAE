package com.simpleaccounts.service;

import com.simpleaccounts.entity.JournalLineItem;
import com.simpleaccounts.entity.TransactionCategoryClosingBalance;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.model.VatReportModel;
import com.simpleaccounts.model.VatReportResponseModel;
import com.simpleaccounts.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simpleaccounts.rest.financialreport.FinancialReportRequestModel;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public abstract class TransactionCategoryClosingBalanceService extends SimpleAccountsService<Integer, TransactionCategoryClosingBalance> {

    public abstract BigDecimal matchClosingBalanceForReconcile(LocalDateTime reconcileDate, TransactionCategory category);

    public abstract void updateClosingBalance(JournalLineItem lineItem) ;

    public abstract List<TransactionCategoryClosingBalance> getList(ReportRequestModel reportRequestModel);

    public abstract List<TransactionCategoryClosingBalance> getListByChartOfAccountIds(ReportRequestModel reportRequestModel);

    public abstract List<VatReportModel> getListByPlaceOfSupply(FinancialReportRequestModel reportRequestModel);

    public abstract TransactionCategoryClosingBalance getLastClosingBalanceByDate(TransactionCategory category);

    public abstract void sumOfTotalAmountExce(FinancialReportRequestModel reportRequestModel, VatReportResponseModel vatReportResponseModel);

    public BigDecimal sumOfTotalAmountClosingBalance(FinancialReportRequestModel reportRequestModel, String lastMonth) {
        return null;
    }
}

