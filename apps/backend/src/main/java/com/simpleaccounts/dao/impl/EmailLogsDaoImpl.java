package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.EmailLogsDao;
import com.simpleaccounts.entity.EmailLogs;
import org.springframework.stereotype.Repository;

@Repository("emailLogs")
public class EmailLogsDaoImpl extends AbstractDao<Integer, EmailLogs> implements EmailLogsDao {
}
