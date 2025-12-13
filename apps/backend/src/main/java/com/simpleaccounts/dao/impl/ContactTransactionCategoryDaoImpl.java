package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.dao.ContactTransactionCategoryRelationDao;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.ContactTransactionCategoryRelation;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.service.ContactService;
import javax.persistence.TypedQuery;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

/**
 * Created By Zain Khan
 */
@Repository("contactTransactionCategoryRelationDao")
@RequiredArgsConstructor
public class ContactTransactionCategoryDaoImpl extends AbstractDao<Integer, ContactTransactionCategoryRelation> implements ContactTransactionCategoryRelationDao {
  private final ContactService contactService;
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
