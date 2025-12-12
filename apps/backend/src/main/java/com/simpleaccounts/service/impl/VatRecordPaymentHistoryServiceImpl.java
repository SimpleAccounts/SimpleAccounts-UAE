package com.simpleaccounts.service.impl;

import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.dao.*;
import com.simpleaccounts.entity.VatRecordPaymentHistory;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.VatRecordPaymentHistoryService;
import com.simpleaccounts.service.VatReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;

        import com.simpleaccounts.constant.dbfilter.ProductFilterEnum;
        import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;
        import com.simpleaccounts.dao.Dao;

        import com.simpleaccounts.entity.Product;
        import com.simpleaccounts.entity.VatReportFiling;
        import com.simpleaccounts.rest.PaginationModel;
        import com.simpleaccounts.rest.PaginationResponseModel;
        import com.simpleaccounts.service.ProductService;
        import com.simpleaccounts.service.VatReportService;
        import org.springframework.beans.factory.annotation.Autowired;
        import org.springframework.cache.Cache;
        import org.springframework.cache.CacheManager;
        import org.springframework.cache.annotation.Cacheable;
        import org.springframework.stereotype.Service;

        import java.util.Collections;
        import java.util.List;
        import java.util.Map;

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
