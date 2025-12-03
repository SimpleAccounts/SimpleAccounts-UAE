package com.simpleaccounts.service;

import com.simpleaccounts.constant.dbfilter.PaymentFilterEnum;
import com.simpleaccounts.dao.MailThemeTemplates;
import com.simpleaccounts.entity.Payment;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 *
 * @author Suraj Rahade
 */
@Service
public abstract class MailThemeTemplatesService extends SimpleAccountsService<Integer, MailThemeTemplates> {
    public abstract void updateMailTheme(Integer templateId);
    public abstract MailThemeTemplates getMailThemeTemplate(Integer moduleId);
}