package com.simplevat.rfq_po;


import com.simplevat.constant.dbfilter.InvoiceFilterEnum;
import com.simplevat.rest.DropdownModel;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.SimpleVatService;

import java.util.List;
import java.util.Map;

public abstract class PoQuatationService extends SimpleVatService<Integer,PoQuatation> {

    public abstract PaginationResponseModel getRfqList(Map<RfqFilterEnum, Object> map, PaginationModel paginationModel);
    public abstract PaginationResponseModel getPOList(Map<POFilterEnum, Object> map, PaginationModel paginationModel);
    public abstract PaginationResponseModel getQuotationList(Map<QuotationFilterEnum, Object> filterDataMap, PaginationModel paginationModel);

    public abstract List<DropdownModel> getRfqPoForDropDown(Integer type);

    public abstract Integer getTotalPoQuotationCountForContact(int contactId);
}
