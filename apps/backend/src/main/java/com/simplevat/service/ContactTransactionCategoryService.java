package com.simplevat.service;

import com.simplevat.entity.Contact;
import com.simplevat.entity.ContactTransactionCategoryRelation;
import com.simplevat.entity.bankaccount.ChartOfAccount;
import com.simplevat.entity.bankaccount.TransactionCategory;

/**
 * Created By Zain Khan
 */
public abstract class ContactTransactionCategoryService extends SimpleVatService<Integer, ContactTransactionCategoryRelation>{
    public abstract void addContactTransactionCategory(Contact contact, TransactionCategory transactionCategoryId);
}
