package com.simpleaccounts.dao;

import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.ContactTransactionCategoryRelation;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;

/**
 * Created By Zain Khan
 */
public interface ContactTransactionCategoryRelationDao extends Dao<Integer, ContactTransactionCategoryRelation>{

   public void addContactTransactionCategory(Contact contact, TransactionCategory transactionCategoryId);
}
