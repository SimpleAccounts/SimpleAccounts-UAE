package com.simpleaccounts.service.impl;


import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.EmailLogsDao;
import com.simpleaccounts.entity.EmailLogs;
import com.simpleaccounts.service.EmaiLogsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service("emailLogsService")
@RequiredArgsConstructor
public class EmailLogsServiceImpl extends EmaiLogsService {

    private final EmailLogsDao emailLogsDao;
    @Override
    protected Dao<Integer, EmailLogs> getDao() {
        return this.emailLogsDao;
    }
}
