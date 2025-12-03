package com.simpleaccounts.dao;

import com.simpleaccounts.entity.FileAttachment;
import com.simpleaccounts.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileAttachmentDao extends Dao<Integer, FileAttachment> {
}
