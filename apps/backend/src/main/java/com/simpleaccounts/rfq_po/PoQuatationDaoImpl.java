package com.simpleaccounts.rfq_po;
import com.simpleaccounts.constant.DatatableSortingFilterConstant;
import com.simpleaccounts.constant.PostingReferenceTypeEnum;
import com.simpleaccounts.constant.dbfilter.DbFilter;
import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.entity.Invoice;
import com.simpleaccounts.rest.DropdownModel;
import com.simpleaccounts.rest.InviceSingleLevelDropdownModel;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.persistence.Query;
import javax.persistence.TypedQuery;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Repository(value = "poQuatationDao")
public class PoQuatationDaoImpl extends AbstractDao<Integer,PoQuatation> implements PoQuatationDao {
    @Autowired
    private DatatableSortingFilterConstant datatableUtil;

   public PaginationResponseModel getRfqList(Map<RfqFilterEnum, Object> filterDataMap, PaginationModel paginationModel){
        List<DbFilter> dbFilters = new ArrayList<>();
        filterDataMap.forEach(
                (productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
                        .condition(productFilter.getCondition()).value(value).build()));
        paginationModel.setSortingCol(
                datatableUtil.getColName(paginationModel.getSortingCol(), DatatableSortingFilterConstant.INVOICE));
        PaginationResponseModel response = new PaginationResponseModel();
        response.setCount(this.getResultCount(dbFilters));
        response.setData(this.executeQuery(dbFilters, paginationModel));
        return response;
    }
    public PaginationResponseModel getPOList(Map<POFilterEnum, Object> filterDataMap, PaginationModel paginationModel){
        List<DbFilter> dbFilters = new ArrayList<>();
        filterDataMap.forEach(
                (productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
                        .condition(productFilter.getCondition()).value(value).build()));
        paginationModel.setSortingCol(
                datatableUtil.getColName(paginationModel.getSortingCol(), DatatableSortingFilterConstant.INVOICE));
        PaginationResponseModel response = new PaginationResponseModel();
        response.setCount(this.getResultCount(dbFilters));
        response.setData(this.executeQuery(dbFilters, paginationModel));
        return response;
    }
    public PaginationResponseModel getQuotationList(Map<QuotationFilterEnum, Object> filterDataMap, PaginationModel paginationModel) {
        List<DbFilter> dbFilters = new ArrayList<>();
        filterDataMap.forEach(
                (productFilter, value) -> dbFilters.add(DbFilter.builder().dbCoulmnName(productFilter.getDbColumnName())
                        .condition(productFilter.getCondition()).value(value).build()));
        paginationModel.setSortingCol(
                datatableUtil.getColName(paginationModel.getSortingCol(), DatatableSortingFilterConstant.INVOICE));
        PaginationResponseModel response = new PaginationResponseModel();
        response.setCount(this.getResultCount(dbFilters));
        response.setData(this.executeQuery(dbFilters, paginationModel));
        return response;
    }
   public List<DropdownModel> getRfqPoForDropDown(Integer type){
      // return getEntityManager().createNamedQuery("getRfqPoForDropDown", DropdownModel.class).getResultList();
       TypedQuery<PoQuatation> query = getEntityManager().createNamedQuery("getRfqPoForDropDown", PoQuatation.class);
       query.setParameter("type", type);
      List<PoQuatation> poQuatationList = query.getResultList();
       if (poQuatationList != null && !poQuatationList.isEmpty()) {
           List<DropdownModel> modelList = new ArrayList<>();
           for (PoQuatation poQuatation : poQuatationList) {

               if (poQuatation.getType()==4) {
                  DropdownModel  model = new DropdownModel(poQuatation.getId(),
                            poQuatation.getPoNumber());
                   modelList.add(model);
               }
               else {
                 DropdownModel   model = new DropdownModel(poQuatation.getId(),
                            poQuatation.getRfqNumber() );
                   modelList.add(model);
               }
           }
           return modelList;
       }
       return new ArrayList<>();
   }
   public Integer getTotalPoQuotationCountForContact(int contactId){
       Query query = getEntityManager().createQuery(
               "SELECT COUNT(i) FROM PoQuatation i WHERE i.supplierId.contactId =:contactId or i.customer.contactId=:contactId AND i.deleteFlag=false" );
       query.setParameter("contactId",contactId);
       List<Object> countList = query.getResultList();
       if (countList != null && !countList.isEmpty()) {
           return ((Long) countList.get(0)).intValue();
       }
       return null;
    }
}
