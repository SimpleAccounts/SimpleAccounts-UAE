/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package com.simpleaccounts.service.impl;

import com.simpleaccounts.dao.Dao;
import lombok.RequiredArgsConstructor;
import com.simpleaccounts.dao.DocumentTemplateDao;
import com.simpleaccounts.entity.DocumentTemplate;
import com.simpleaccounts.service.DocumentTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 *
 * @author daynil
 */

@Service
@Transactional
@RequiredArgsConstructor
public class DocumentTemplateServiceImpl extends DocumentTemplateService {

    private final DocumentTemplateDao dao;

    @Override
    public DocumentTemplate getDocumentTemplateById(Integer documentTemplateId) {
        return dao.getDocumentTemplateById(documentTemplateId);

    }

    @Override
    protected Dao<Integer, DocumentTemplate> getDao() {
        return dao;
    }
}
