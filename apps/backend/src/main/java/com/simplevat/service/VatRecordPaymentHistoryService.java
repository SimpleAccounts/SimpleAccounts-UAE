package com.simplevat.service;

import com.simplevat.constant.dbfilter.VatCategoryFilterEnum;
import com.simplevat.constant.dbfilter.VatReportFilterEnum;
import com.simplevat.entity.VatCategory;
import com.simplevat.entity.VatRecordPaymentHistory;
import com.simplevat.entity.VatReportFiling;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import java.util.Map;

public abstract class VatRecordPaymentHistoryService extends SimpleVatService<Integer, VatRecordPaymentHistory> {

    public abstract PaginationResponseModel getVatReportList(Map<VatReportFilterEnum, Object> filterMap, PaginationModel paginationModel);
}
