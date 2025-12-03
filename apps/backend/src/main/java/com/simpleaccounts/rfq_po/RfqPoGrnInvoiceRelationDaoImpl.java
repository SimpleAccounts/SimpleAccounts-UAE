package com.simpleaccounts.rfq_po;

import com.simpleaccounts.dao.AbstractDao;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository(value = "rfqPoGrnInvoiceRelationDao")
public class RfqPoGrnInvoiceRelationDaoImpl  extends AbstractDao<Integer, RfqPoGrnRelation> implements RfqPoGrnInvoiceRelationDao{


 public void addRfqPoGrnRelation(PoQuatation parentPoQuatation, PoQuatation childPoQuotation){

     RfqPoGrnRelation rfqPoGrnRelation = new RfqPoGrnRelation();
       rfqPoGrnRelation.setParentID(parentPoQuatation);
       rfqPoGrnRelation.setParentType(parentPoQuatation.getType());
       rfqPoGrnRelation.setChildID(childPoQuotation);
       rfqPoGrnRelation.setChildType(childPoQuotation.getType());
       persist(rfqPoGrnRelation);
   }
  public List<String> getPoGrnListByParentId(Integer parentId){
     return null;
  }
   public List<PoQuatation> getRPoGrnById(Integer id){

     return null;
   }
}
