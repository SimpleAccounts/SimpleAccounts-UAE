package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.EmailLogsDao;
import com.simpleaccounts.entity.EmailLogs;
import com.simpleaccounts.service.EmaiLogsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service("emailLogsService")
public class EmailLogsServiceImpl extends EmaiLogsService {

    @Autowired
    EmailLogsDao emailLogsDao;
    @Override
    protected Dao<Integer, EmailLogs> getDao() {
        return this.emailLogsDao;
    }
}
