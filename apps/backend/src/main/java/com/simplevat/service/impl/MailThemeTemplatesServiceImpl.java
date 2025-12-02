package com.simplevat.service.impl;

import com.simplevat.constant.dbfilter.PaymentFilterEnum;
import com.simplevat.dao.Dao;
import com.simplevat.dao.MailThemeTemplates;
import com.simplevat.dao.MailThemeTemplatesDao;
import com.simplevat.dao.PaymentDao;
import com.simplevat.entity.Payment;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import com.simplevat.service.MailThemeTemplatesService;
import com.simplevat.service.PaymentService;
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
