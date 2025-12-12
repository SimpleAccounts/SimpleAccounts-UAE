package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.dao.MailThemeTemplates;
import com.simpleaccounts.dao.MailThemeTemplatesDao;

import com.simpleaccounts.service.MailThemeTemplatesService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author admin
 */
@Service("mailThemeTemplatesService")
@Transactional
@RequiredArgsConstructor
public class MailThemeTemplatesServiceImpl extends MailThemeTemplatesService {

    private final MailThemeTemplatesDao mailThemeTemplatesDao;

    @Override
    protected Dao<Integer, MailThemeTemplates> getDao() {
        return this.mailThemeTemplatesDao;
    }
    @Override
    public void updateMailTheme(Integer templateId){
       mailThemeTemplatesDao.updateMailTheme(templateId);
    }
    @Override
    public MailThemeTemplates getMailThemeTemplate(Integer moduleId){
        return mailThemeTemplatesDao.getMailThemeTemplate(moduleId);
    }
}
