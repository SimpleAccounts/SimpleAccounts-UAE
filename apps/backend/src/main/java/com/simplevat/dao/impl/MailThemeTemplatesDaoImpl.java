package com.simplevat.dao.impl;

import com.simplevat.constant.CommonColumnConstants;
import com.simplevat.dao.AbstractDao;
import com.simplevat.dao.LanguageDao;
import com.simplevat.dao.MailThemeTemplates;
import com.simplevat.dao.MailThemeTemplatesDao;
import com.simplevat.entity.Language;
import org.springframework.stereotype.Repository;

import javax.persistence.Query;
import javax.persistence.TypedQuery;
import java.util.List;


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