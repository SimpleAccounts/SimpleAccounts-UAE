package com.simpleaccounts.service.impl;

import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.VatReportsDao;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.VatReportService;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
@Service("VatReportService")
@RequiredArgsConstructor
public class VatReportServiceImp extends VatReportService {

    private final VatReportsDao vatReportsDao;

    @Override
    protected Dao<Integer, VatReportFiling> getDao() {
        return vatReportsDao;
    }

    @Override
    public PaginationResponseModel getVatReportList(Map<VatReportFilterEnum, Object> filterMap, PaginationModel paginationModel) {
        return vatReportsDao.getVatReportList(filterMap,paginationModel);
    }

}
