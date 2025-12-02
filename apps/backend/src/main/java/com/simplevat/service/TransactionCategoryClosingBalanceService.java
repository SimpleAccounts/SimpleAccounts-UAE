package com.simplevat.service;

import com.simplevat.entity.JournalLineItem;
import com.simplevat.entity.TransactionCategoryClosingBalance;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.model.VatReportModel;
import com.simplevat.model.VatReportResponseModel;
import com.simplevat.rest.detailedgeneralledgerreport.ReportRequestModel;
import com.simplevat.rest.financialreport.FinancialReportRequestModel;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public abstract class TransactionCategoryClosingBalanceService extends SimpleVatService<Integer, TransactionCategoryClosingBalance> {

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

