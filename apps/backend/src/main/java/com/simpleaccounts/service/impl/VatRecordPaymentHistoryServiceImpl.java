package com.simpleaccounts.service.impl;

import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.dao.*;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.VatRecordPaymentHistory;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.VatRecordPaymentHistoryService;
import java.util.Map;
import org.springframework.stereotype.Service;





@Service("VatRecordPaymentHistoryService")
@RequiredArgsConstructor
public class VatRecordPaymentHistoryServiceImpl extends VatRecordPaymentHistoryService {

    private final VatRecordPaymentHistoryDao vatReportsDao;

    @Override
    protected Dao<Integer, VatRecordPaymentHistory> getDao() {
        return vatReportsDao;
    }

    @Override
    public PaginationResponseModel getVatReportList(Map<VatReportFilterEnum, Object> filterMap, PaginationModel paginationModel) {
        return vatReportsDao.getVatReportList(filterMap,paginationModel);
    }

}
