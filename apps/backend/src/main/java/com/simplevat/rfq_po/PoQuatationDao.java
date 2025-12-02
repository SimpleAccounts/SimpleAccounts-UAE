package com.simplevat.rfq_po;


import com.simplevat.dao.Dao;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

public interface PoQuatationDao extends Dao<Integer,PoQuatation> {

    PaginationResponseModel getRfqList(Map<RfqFilterEnum, Object> filterDataMap, PaginationModel paginationModel);
    PaginationResponseModel getPOList(Map<POFilterEnum, Object> filterDataMap, PaginationModel paginationModel);

    PaginationResponseModel getQuotationList(Map<QuotationFilterEnum, Object> filterDataMap, PaginationModel paginationModel);

    List<DropdownModel> getRfqPoForDropDown(Integer type);

    Integer getTotalPoQuotationCountForContact(int contactId);
}
