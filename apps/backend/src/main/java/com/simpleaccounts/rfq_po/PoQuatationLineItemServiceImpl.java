package com.simpleaccounts.rfq_po;

import com.simpleaccounts.dao.Dao;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;

@Service("poQuatationLineItemService")
@Transactional

public class PoQuatationLineItemServiceImpl extends PoQuatationLineItemService{
    @Autowired
    private PoQuatationLineItemDao poQuatationLineItemDao;
    @Override
    protected Dao<Integer, PoQuatationLineItem> getDao() {
        return this.poQuatationLineItemDao;
    }

    public  void deleteByRfqId(Integer id){
         poQuatationLineItemDao.deleteByRfqId(id);
    }

//    public  void deleteByQuotationId(Integer id){
//        poQuatationLineItemDao.deleteByQuotationId(id);
//    }
}
