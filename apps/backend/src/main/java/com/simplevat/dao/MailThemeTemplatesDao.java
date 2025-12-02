package com.simplevat.dao;

import com.simplevat.constant.dbfilter.ProductFilterEnum;
import com.simplevat.entity.Product;
import com.simplevat.rest.PaginationModel;
import com.simplevat.rest.PaginationResponseModel;

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