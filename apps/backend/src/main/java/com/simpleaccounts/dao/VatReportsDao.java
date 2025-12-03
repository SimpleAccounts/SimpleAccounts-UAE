package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.ProductFilterEnum;
import com.simpleaccounts.constant.dbfilter.VatReportFilterEnum;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.entity.VatReportFiling;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

/**
 *
 * @author Shoaib
 */
public interface VatReportsDao extends Dao<Integer, VatReportFiling> {

    public PaginationResponseModel getVatReportList(Map<VatReportFilterEnum, Object> filterMap, PaginationModel paginationModel);

}
