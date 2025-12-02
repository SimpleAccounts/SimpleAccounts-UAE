package com.simplevat.dao.impl;

import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.EmailLogsDao;
import com.simplevat.entity.EmailLogs;
import org.springframework.stereotype.Repository;

@Repository("emailLogs")
public class EmailLogsDaoImpl extends AbstractDao<Integer, EmailLogs> implements EmailLogsDao {
}
