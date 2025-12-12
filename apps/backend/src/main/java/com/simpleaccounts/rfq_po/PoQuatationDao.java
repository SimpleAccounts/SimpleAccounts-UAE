package com.simpleaccounts.rfq_po;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

public interface PoQuatationDao extends Dao<Integer,PoQuatation> {

    PaginationResponseModel getRfqList(Map<RfqFilterEnum, Object> filterDataMap, PaginationModel paginationModel);
    PaginationResponseModel getPOList(Map<POFilterEnum, Object> filterDataMap, PaginationModel paginationModel);

    PaginationResponseModel getQuotationList(Map<QuotationFilterEnum, Object> filterDataMap, PaginationModel paginationModel);

    List<DropdownModel> getRfqPoForDropDown(Integer type);

    Integer getTotalPoQuotationCountForContact(int contactId);
}
