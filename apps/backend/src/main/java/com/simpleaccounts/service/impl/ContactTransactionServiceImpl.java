package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.ContactTransactionCategoryRelationDao;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.entity.Contact;
import com.simpleaccounts.entity.ContactTransactionCategoryRelation;
import com.simpleaccounts.entity.bankaccount.TransactionCategory;
import com.simpleaccounts.service.ContactTransactionCategoryService;
import org.springframework.stereotype.Service;

/**
 * Created By Zain Khan
 */
@Service("contactTransactionCategoryService")
@RequiredArgsConstructor
public class ContactTransactionServiceImpl extends ContactTransactionCategoryService {
    private final ContactTransactionCategoryRelationDao contactTransactionCategoryRelationDao;
    @Override
    public Dao<Integer, ContactTransactionCategoryRelation> getDao() {
        return this.contactTransactionCategoryRelationDao;
    }
    public  void addContactTransactionCategory(Contact contact, TransactionCategory transactionCategoryId){
        contactTransactionCategoryRelationDao.addContactTransactionCategory(contact,transactionCategoryId);
    }
}
