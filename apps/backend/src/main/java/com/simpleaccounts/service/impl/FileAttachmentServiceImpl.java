package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.FileAttachmentDao;
import com.simpleaccounts.entity.FileAttachment;

import com.simpleaccounts.service.FileAttachmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FileAttachmentServiceImpl  extends FileAttachmentService {
    @Autowired
    private FileAttachmentDao fileAttachmentDao;
    @Override
    protected Dao<Integer, FileAttachment> getDao() {
        return fileAttachmentDao;
    }
}
