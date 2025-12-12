package com.simpleaccounts.dao;

/**
 *
 * @author Suraj rahade
 */
public interface MailThemeTemplatesDao extends Dao<Integer, MailThemeTemplates> {
    public void updateMailTheme(Integer templateId);
    public MailThemeTemplates getMailThemeTemplate(Integer moduleId);
}