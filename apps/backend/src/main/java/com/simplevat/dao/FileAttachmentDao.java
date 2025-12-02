package com.simplevat.dao;

import com.simplevat.entity.FileAttachment;
import com.simplevat.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileAttachmentDao extends Dao<Integer, FileAttachment> {
}
