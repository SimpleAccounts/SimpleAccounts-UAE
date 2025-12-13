package com.simpleaccounts.rfq_po;

import com.simpleaccounts.dao.Dao;
import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("poQuatationLineItemService")
@Transactional

@RequiredArgsConstructor
public class PoQuatationLineItemServiceImpl extends PoQuatationLineItemService{
    private final PoQuatationLineItemDao poQuatationLineItemDao;
    @Override
    protected Dao<Integer, PoQuatationLineItem> getDao() {
        return this.poQuatationLineItemDao;
    }

    public  void deleteByRfqId(Integer id){
         poQuatationLineItemDao.deleteByRfqId(id);
    }

}
