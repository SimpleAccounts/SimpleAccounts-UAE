package com.simpleaccounts.service.impl;

import com.simpleaccounts.constant.dbfilter.PaymentFilterEnum;
import com.simpleaccounts.dao.Dao;
import com.simpleaccounts.dao.MailThemeTemplates;
import com.simpleaccounts.dao.MailThemeTemplatesDao;
import com.simpleaccounts.dao.PaymentDao;
import com.simpleaccounts.entity.Payment;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import com.simpleaccounts.service.MailThemeTemplatesService;
import com.simpleaccounts.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

/**
 *
 * @author admin
 */
@Service("mailThemeTemplatesService")
@Transactional
public class MailThemeTemplatesServiceImpl extends MailThemeTemplatesService {

    @Autowired
    private MailThemeTemplatesDao mailThemeTemplatesDao;

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
