package com.simpleaccounts.rfq_po;

import com.simpleaccounts.dao.AbstractDao;
import javax.persistence.Query;
import org.springframework.stereotype.Repository;

@Repository(value = "poQuatationLineItemDaoImpl")
public class PoQuatationLineItemDaoImpl  extends AbstractDao<Integer,PoQuatationLineItem> implements PoQuatationLineItemDao{

   public void deleteByRfqId(Integer id){
       Query query = getEntityManager().createQuery("DELETE FROM PoQuatationLineItem i WHERE i.poQuatation.id = :id ");
       query.setParameter("id", id);
       query.executeUpdate();
    }
}
