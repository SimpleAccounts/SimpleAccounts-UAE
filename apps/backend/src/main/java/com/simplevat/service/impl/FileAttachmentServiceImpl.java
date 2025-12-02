package com.simplevat.service.impl;


import com.simplevat.dao.Dao;
import com.simplevat.dao.FileAttachmentDao;
import com.simplevat.entity.FileAttachment;
import com.simplevat.entity.Invoice;
import com.simplevat.service.FileAttachmentService;
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
