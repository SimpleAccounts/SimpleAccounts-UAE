package com.simpleaccounts.service;

import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.ContactTransactionCategoryRelation;

import com.simpleaccounts.entity.bankaccount.TransactionCategory;

/**
 * Created By Zain Khan
 */
public abstract class ContactTransactionCategoryService extends SimpleAccountsService<Integer, ContactTransactionCategoryRelation>{
    public abstract void addContactTransactionCategory(Contact contact, TransactionCategory transactionCategoryId);
}
