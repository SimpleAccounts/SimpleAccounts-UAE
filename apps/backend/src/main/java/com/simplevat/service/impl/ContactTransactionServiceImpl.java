package com.simplevat.service.impl;

import com.simplevat.dao.ContactTransactionCategoryRelationDao;
import com.simplevat.dao.Dao;
import com.simplevat.entity.Contact;
import com.simplevat.entity.ContactTransactionCategoryRelation;
import com.simplevat.entity.bankaccount.TransactionCategory;
import com.simplevat.service.ContactTransactionCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Created By Zain Khan
 */
@Service("contactTransactionCategoryService")
public class ContactTransactionServiceImpl extends ContactTransactionCategoryService {
    @Autowired
    private ContactTransactionCategoryRelationDao contactTransactionCategoryRelationDao;
    @Override
    public Dao<Integer, ContactTransactionCategoryRelation> getDao() {
        return this.contactTransactionCategoryRelationDao;
    }
    public  void addContactTransactionCategory(Contact contact, TransactionCategory transactionCategoryId){
        contactTransactionCategoryRelationDao.addContactTransactionCategory(contact,transactionCategoryId);
    }
}
