package com.simpleaccounts.rfq_po;


import com.simpleaccounts.constant.dbfilter.InvoiceFilterEnum;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.SimpleAccountsService;

import java.util.List;
import java.util.Map;

public abstract class PoQuatationService extends SimpleAccountsService<Integer,PoQuatation> {

    public abstract PaginationResponseModel getRfqList(Map<RfqFilterEnum, Object> map, PaginationModel paginationModel);
    public abstract PaginationResponseModel getPOList(Map<POFilterEnum, Object> map, PaginationModel paginationModel);
    public abstract PaginationResponseModel getQuotationList(Map<QuotationFilterEnum, Object> filterDataMap, PaginationModel paginationModel);

    public abstract List<DropdownModel> getRfqPoForDropDown(Integer type);

    public abstract Integer getTotalPoQuotationCountForContact(int contactId);
}
