package com.simplevat.service.impl;

import com.simplevat.constant.dbfilter.VatReportFilterEnum;
import com.simplevat.dao.*;
import com.simplevat.entity.VatRecordPaymentHistory;
import com.simplevat.entity.VatReportFiling;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.VatRecordPaymentHistoryService;
import com.simplevat.service.VatReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Map;


        import com.simplevat.constant.dbfilter.ProductFilterEnum;
        import com.simplevat.constant.dbfilter.VatReportFilterEnum;
        import com.simplevat.dao.Dao;
import com.simplevat.dao.VatReportsDao;
        import com.simplevat.entity.Product;
        import com.simplevat.entity.VatReportFiling;
        import com.simplevat.rest.PaginationModel;
        import com.simplevat.rest.PaginationResponseModel;
        import com.simplevat.service.ProductService;
        import com.simplevat.service.VatReportService;
        import org.springframework.beans.factory.annotation.Autowired;
        import org.springframework.cache.Cache;
        import org.springframework.cache.CacheManager;
        import org.springframework.cache.annotation.Cacheable;
        import org.springframework.stereotype.Service;

        import java.util.Collections;
        import java.util.List;
        import java.util.Map;


@Service("VatRecordPaymentHistoryService")
public class VatRecordPaymentHistoryServiceImpl extends VatRecordPaymentHistoryService {

    @Autowired
    private VatRecordPaymentHistoryDao vatReportsDao;

    @Override
    protected Dao<Integer, VatRecordPaymentHistory> getDao() {
        return vatReportsDao;
    }

    @Override
    public PaginationResponseModel getVatReportList(Map<VatReportFilterEnum, Object> filterMap, PaginationModel paginationModel) {
        return vatReportsDao.getVatReportList(filterMap,paginationModel);
    }

}
