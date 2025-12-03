package com.simpleaccounts.dao;

import com.simpleaccounts.constant.dbfilter.ProductFilterEnum;
import com.simpleaccounts.entity.Product;
import com.simpleaccounts.rest.PaginationModel;
import com.simpleaccounts.rest.PaginationResponseModel;

import java.util.List;
import java.util.Map;

/**
 *
 * @author Suraj rahade
 */
public interface MailThemeTemplatesDao extends Dao<Integer, MailThemeTemplates> {
    public void updateMailTheme(Integer templateId);
    public MailThemeTemplates getMailThemeTemplate(Integer moduleId);
}