package com.simplevat.service;

import com.simplevat.constant.dbfilter.PaymentFilterEnum;
import com.simplevat.dao.MailThemeTemplates;
import com.simplevat.entity.Payment;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

/**
 *
 * @author Suraj Rahade
 */
@Service
public abstract class MailThemeTemplatesService extends SimpleVatService<Integer, MailThemeTemplates> {
    public abstract void updateMailTheme(Integer templateId);
    public abstract MailThemeTemplates getMailThemeTemplate(Integer moduleId);
}