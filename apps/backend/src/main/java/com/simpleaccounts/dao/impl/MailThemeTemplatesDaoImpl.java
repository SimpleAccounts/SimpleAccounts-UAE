package com.simpleaccounts.dao.impl;

import com.simpleaccounts.dao.AbstractDao;
import com.simpleaccounts.dao.MailThemeTemplates;
import com.simpleaccounts.dao.MailThemeTemplatesDao;
import javax.persistence.Query;
import org.springframework.stereotype.Repository;

/**
 * Created by Suraj Rahade .
 */
@Repository
public class MailThemeTemplatesDaoImpl extends AbstractDao<Integer, MailThemeTemplates> implements MailThemeTemplatesDao {
    @Override
    public void updateMailTheme(Integer templateId){

        Query query1=getEntityManager()
                .createQuery("UPDATE MailThemeTemplates m SET m.templateEnable=false WHERE m.templateEnable=true ");
        query1.executeUpdate();

        Query query=getEntityManager()
                .createQuery("UPDATE MailThemeTemplates m SET m.templateEnable=true WHERE m.templateId = :templateId ");
        query.setParameter("templateId", templateId);
        query.executeUpdate();
    }

    @Override
    public MailThemeTemplates getMailThemeTemplate(Integer moduleId){

        String quertStr = "SELECT m FROM MailThemeTemplates m WHERE m.moduleId=:moduleId and m.templateEnable=true";
        Query query = getEntityManager().createQuery(quertStr);
        query.setParameter("moduleId", moduleId);
        return (MailThemeTemplates) query.getSingleResult();
    }

}