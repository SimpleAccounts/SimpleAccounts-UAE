package com.simplevat.dao;

import com.simplevat.constant.dbfilter.ProductFilterEnum;
import com.simplevat.constant.dbfilter.VatReportFilterEnum;
import com.simplevat.entity.Product;
import com.simplevat.entity.VatRecordPaymentHistory;
import com.simplevat.entity.VatReportFiling;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

/**
 *
 * @author Shoaib
 */
public interface VatRecordPaymentHistoryDao extends Dao<Integer, VatRecordPaymentHistory> {

    public PaginationResponseModel getVatReportList(Map<VatReportFilterEnum, Object> filterMap, PaginationModel paginationModel);

}

