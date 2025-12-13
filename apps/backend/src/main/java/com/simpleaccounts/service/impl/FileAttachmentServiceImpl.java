package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.dao.FileAttachmentDao;
import com.simpleaccounts.entity.FileAttachment;
import com.simpleaccounts.service.FileAttachmentService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FileAttachmentServiceImpl  extends FileAttachmentService {
    private final FileAttachmentDao fileAttachmentDao;
    @Override
    protected Dao<Integer, FileAttachment> getDao() {
        return fileAttachmentDao;
    }
}
