package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.FileAttachmentDao;
import com.simpleaccounts.entity.FileAttachment;
import org.springframework.stereotype.Repository;

@Repository
public class FileAttachmentDaoImpl extends AbstractDao<Integer, FileAttachment> implements FileAttachmentDao {
}
