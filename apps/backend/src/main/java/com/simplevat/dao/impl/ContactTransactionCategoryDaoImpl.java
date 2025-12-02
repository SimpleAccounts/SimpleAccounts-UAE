package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.ContactTransactionCategoryRelationDao;
import com.simplevat.entity.CoacTransactionCategory;
import com.simplevat.entity.Contact;
import com.simplevat.entity.ContactTransactionCategoryRelation;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.service.ContactService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.persistence.TypedQuery;
import java.util.List;

/**
 * Created By Zain Khan
 */
@Repository("contactTransactionCategoryRelationDao")
public class ContactTransactionCategoryDaoImpl extends AbstractDao<Integer, ContactTransactionCategoryRelation> implements ContactTransactionCategoryRelationDao {
  @Autowired
  private ContactService contactService;
   public void addContactTransactionCategory(Contact contact, TransactionCategory transactionCategory) {
       String query = "SELECT MAX(id) FROM ContactTransactionCategoryRelation ORDER BY id DESC";

       TypedQuery<Integer> typedQuery = getEntityManager().createQuery(query, Integer.class);

       Integer id = typedQuery.getSingleResult();
       id = id + 1;
       ContactTransactionCategoryRelation contactTransactionCategoryRelation = new ContactTransactionCategoryRelation();
       contactTransactionCategoryRelation.setContact(contact);
       contactTransactionCategoryRelation.setTransactionCategory(transactionCategory);
       contactTransactionCategoryRelation.setId(id);
       persist(contactTransactionCategoryRelation);

   }
}
