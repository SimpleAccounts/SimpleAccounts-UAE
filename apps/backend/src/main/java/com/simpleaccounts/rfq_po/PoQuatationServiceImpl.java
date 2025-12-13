package com.simpleaccounts.rfq_po;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service("poQuatationService")
@Transactional
@RequiredArgsConstructor
public class PoQuatationServiceImpl extends PoQuatationService{
    private final PoQuatationDao poQuatationDao;
    @Override
    protected Dao<Integer, PoQuatation> getDao() {
        return this.poQuatationDao;
    }

    public PaginationResponseModel getRfqList(Map<RfqFilterEnum, Object> filterDataMap, PaginationModel paginationModel){
        return poQuatationDao.getRfqList(filterDataMap,paginationModel);
    }
    public PaginationResponseModel getPOList(Map<POFilterEnum, Object> filterDataMap, PaginationModel paginationModel){
        return poQuatationDao.getPOList(filterDataMap,paginationModel);
    }
    public PaginationResponseModel getQuotationList(Map<QuotationFilterEnum, Object> filterDataMap,  PaginationModel paginationModel) {
        return poQuatationDao.getQuotationList(filterDataMap,paginationModel);
    }
    public List<DropdownModel> getRfqPoForDropDown(Integer type){
        return poQuatationDao.getRfqPoForDropDown(type);
    }
    public  Integer getTotalPoQuotationCountForContact(int contactId){
        return poQuatationDao.getTotalPoQuotationCountForContact(contactId);
    }

}
