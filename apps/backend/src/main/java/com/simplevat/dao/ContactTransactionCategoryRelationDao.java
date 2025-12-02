package com.simplevat.dao;

import com.simplevat.entity.Contact;
import com.simplevat.entity.ContactTransactionCategoryRelation;
import com.simplevat.entity.bankaccount.TransactionCategory;

/**
 * Created By Zain Khan
 */
public interface ContactTransactionCategoryRelationDao extends Dao<Integer, ContactTransactionCategoryRelation>{

   public void addContactTransactionCategory(Contact contact, TransactionCategory transactionCategoryId);
}
