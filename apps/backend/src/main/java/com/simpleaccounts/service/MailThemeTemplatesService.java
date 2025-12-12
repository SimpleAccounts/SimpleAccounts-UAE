package com.simpleaccounts.service;

import com.simpleaccounts.dao.MailThemeTemplates;

import org.springframework.stereotype.Service;

/**
 *
 * @author Suraj Rahade
 */
@Service
public abstract class MailThemeTemplatesService extends SimpleAccountsService<Integer, MailThemeTemplates> {
    public abstract void updateMailTheme(Integer templateId);
    public abstract MailThemeTemplates getMailThemeTemplate(Integer moduleId);
}