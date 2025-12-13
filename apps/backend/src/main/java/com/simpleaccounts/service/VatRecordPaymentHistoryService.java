package com.simpleaccounts.service;

import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;

import com.simpleaccounts.entity.VatRecordPaymentHistory;

import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.Map;

public abstract class VatRecordPaymentHistoryService extends SimpleAccountsService<Integer, VatRecordPaymentHistory> {

    public abstract PaginationResponseModel getVatReportList(Map<VatReportFilterEnum, Object> filterMap, PaginationModel paginationModel);
}
