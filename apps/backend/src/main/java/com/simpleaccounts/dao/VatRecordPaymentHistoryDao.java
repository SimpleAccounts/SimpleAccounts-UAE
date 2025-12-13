package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;
import com.simpleaccounts.entity.VatRecordPaymentHistory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.Map;

/**
 *
 * @author Shoaib
 */
public interface VatRecordPaymentHistoryDao extends Dao<Integer, VatRecordPaymentHistory> {

    public PaginationResponseModel getVatReportList(Map<VatReportFilterEnum, Object> filterMap, PaginationModel paginationModel);

}

