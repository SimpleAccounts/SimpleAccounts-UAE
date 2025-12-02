package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.FileAttachmentDao;
import com.simplevat.dao.InvoiceDao;
import com.simplevat.entity.FileAttachment;
import com.simplevat.entity.Invoice;
import org.springframework.stereotype.Repository;

@Repository
public class FileAttachmentDaoImpl extends AbstractDao<Integer, FileAttachment> implements FileAttachmentDao {
}
