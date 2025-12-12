package com.simpleaccounts.rfq_po;

import com.simpleaccounts.dao.Dao;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service("rfqPoGrnInvoiceRelationService")
@Transactional
@RequiredArgsConstructor
public class RfqPoGrnInvoiceRelationServiceImpl extends RfqPoGrnInvoiceRelationService {
    private final RfqPoGrnInvoiceRelationDao rfqPoGrnInvoiceRelationDao;
    @Override
    protected Dao<Integer, RfqPoGrnRelation> getDao() {
        return this.rfqPoGrnInvoiceRelationDao;
    }
    public  void addRfqPoGrnRelation(PoQuatation parentPoQuatation,PoQuatation childPoQuotation){
        rfqPoGrnInvoiceRelationDao.addRfqPoGrnRelation(parentPoQuatation,childPoQuotation);
    }
    public  List<String> getPoGrnListByParentId(Integer parentId){
        return rfqPoGrnInvoiceRelationDao.getPoGrnListByParentId(parentId);
    }
    public  List<PoQuatation> getRPoGrnById(Integer id){
        return rfqPoGrnInvoiceRelationDao.getRPoGrnById(id);
    }
}
