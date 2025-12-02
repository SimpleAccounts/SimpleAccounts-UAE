package com.simplevat.service.impl;

import com.simplevat.dao.Dao;
import com.simplevat.dao.EmailLogsDao;
import com.simplevat.entity.EmailLogs;
import com.simplevat.service.EmaiLogsService;
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
